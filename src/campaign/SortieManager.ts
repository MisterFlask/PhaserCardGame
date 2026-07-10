import { EncounterManager } from "../encounters/EncounterManager";
import { EventsManager } from "../events/EventsManager";
import { injectCargoIntoSquad, stripCargoFromSquad } from "../gamecharacters/cargo/CargoInjection";
import { Lethality } from "../gamecharacters/buffs/standard/Lethality";
import { Stress } from "../gamecharacters/buffs/standard/Stress";
import { PlayerCharacter } from "../gamecharacters/PlayerCharacter";
import { AbstractReward } from "../rewards/AbstractReward";
import { GameState } from "../rules/GameState";
import { CampaignUiState } from "../screens/campaign/hq_ux/CampaignUiState";
import { SceneChanger } from "../screens/SceneChanger";
import { applyHpHardening, hardeningForYear } from "./EncounterHardening";
import { Contract } from "./Contract";
import { ContractGenerator } from "./ContractGenerator";
import { settleDeaths } from "./DeathSettlement";
import { xpForCombatWin } from "./Leveling";
import { StandingOrdersState } from "./orders/StandingOrdersState";
import { applyCasualties } from "./SortieResolution";
import { ESCROW_RECOVERY_STRESS, ESCROW_RECOVERY_WOUND_WEEKS, SoulCollateralOffice } from "../strategic_projects/SoulCollateralOffice";
import { ProbateAndEffectsOffice } from "../strategic_projects/ProbateAndEffectsOffice";
import { mergeStockWithLoadout } from "./ConsumableStock";
import { PlaytestJournal } from "../utils/PlaytestJournal";

/**
 * Runs a contract sortie: a fixed sequence of 1-2 combats with no node map.
 * HP persists across combats within the sortie. On resolution: payout to the
 * vault, wounds/deaths applied to the roster, campaign time advances.
 */
export class SortieManager {
    private static instance: SortieManager;
    public static getInstance(): SortieManager {
        if (!SortieManager.instance) {
            SortieManager.instance = new SortieManager();
        }
        return SortieManager.instance;
    }
    private constructor() {}

    public activeContract: Contract | null = null;
    public squad: PlayerCharacter[] = [];
    public combatsCompleted: number = 0;
    /** Set at resolution so the HQ can show a report. */
    public lastSortieReport: string[] = [];
    /** True until the debrief screen has been shown once. */
    public hasUnviewedReport: boolean = false;
    /**
     * Name of a consumable owed to the player from the just-resolved
     * contract's reward, or null. SortieManager stays Phaser-free (house
     * rule 1) and cannot import ConsumablesLibrary to instantiate or price
     * it, so it only records the name here; the HQ UI layer (which already
     * reads lastSortieReport post-resolution) resolves the name, grants it
     * to campaign stock if under cap, or banks half its price as resale if
     * at cap, then clears this field.
     */
    public pendingConsumableRewardName: string | null = null;

    public isActive(): boolean {
        return this.activeContract !== null;
    }

    public combatsRemaining(): number {
        return this.activeContract ? this.activeContract.numCombats - this.combatsCompleted : 0;
    }

    public startSortie(contract: Contract, squad: PlayerCharacter[]): void {
        const gameState = GameState.getInstance();

        this.activeContract = contract;
        this.squad = squad;
        this.combatsCompleted = 0;
        this.lastSortieReport = [];

        // Contract accepted: off the board.
        const campaign = CampaignUiState.getInstance();
        campaign.availableContracts = campaign.availableContracts.filter(c => c.id !== contract.id);
        campaign.selectedContract = null;

        // The squad deployed rested; within the sortie HP carries between combats.
        squad.forEach(character => {
            character.hitpoints = character.maxHitpoints;
        });

        gameState.currentRunCharacters = squad;
        gameState.initializeRun();
        gameState.currentAct = contract.act;

        // Trade Run: freight the player loaded at muster clogs the squad's
        // decks for the sortie. cratesLoaded is chosen at dispatch (never
        // serialized — see Contract.cratesLoaded doc); injection round-robins
        // 2 cargo cards per crate across the deployed squad. Stripped again
        // on every exit path (resolveSortie / handleSquadWipe below) so
        // cargo never survives to the next sortie or a save.
        if (contract.isTradeRun && contract.cratesLoaded > 0) {
            injectCargoIntoSquad(squad, contract.cratesLoaded);
        }

        // Every owned consumable rides along on every sortie (no loadout
        // picker in v1): transfer ownership from campaign stock into the
        // active loadout. A move, not a copy — CampaignUiState.consumables
        // is empty for the sortie's duration (house rule 3: one owner).
        // The dynamic stock cap (The Bonded Warehouse) is stamped onto the
        // sortie state at the same handoff moment, so combat slot rendering
        // and event grants honor it without importing the campaign layer.
        gameState.consumables = [...campaign.consumables];
        campaign.consumables = [];
        gameState.maxConsumables = campaign.getConsumableStockCap();

        // Deployed soldiers' equipped relics ride along too (same transfer
        // pattern as consumables): they never leave their owner's slots
        // conceptually, but the combat-facing inventory needs them present.
        // gameState.relicsInventory was just reset to [] by initializeRun()
        // above; this appends the squad's equipped relics on top of it.
        squad.forEach(character => {
            gameState.relicsInventory.push(...character.equippedRelics);
        });

        PlaytestJournal.getInstance().record('sortie_dispatched', { contractType: contract.type, act: contract.act, segment: contract.segment, squadSize: squad.length, payout: contract.projectedPayout, crates: contract.cratesLoaded });

        this.launchNextCombat();
    }

    /** Chance that a narrative event interrupts a sortie combat. */
    private static readonly EVENT_CHANCE = 0.35;

    public launchNextCombat(): void {
        if (!this.activeContract) return;
        const encounter = EncounterManager.getInstance()
            .getRandomCombatEncounter(this.activeContract.act, this.activeContract.segment);

        // Hell hardens with campaign time: scale this fresh batch of enemies
        // by the current year before anything else touches them (design doc:
        // "Hell escalates too — regions harden over time"). Event-spawned
        // combats are hardened at DeadEndStartEncounterChoice.effect().
        const campaign = CampaignUiState.getInstance();
        const year = campaign.calendar.year;
        applyHpHardening(encounter.enemies, year);
        const { lethalityBonus } = hardeningForYear(year);
        if (lethalityBonus > 0) {
            encounter.enemies.forEach(enemy => {
                enemy.applyBuffs_useFromActionManager([new Lethality(lethalityBonus)]);
            });
        }

        // Something on the road: the event shows before the fight, and its
        // choices may replace or extend the combat (tolls, escaped daemons...).
        if (Math.random() < SortieManager.EVENT_CHANCE) {
            encounter.event = EventsManager.getInstance().getRandomEvent();
            encounter.eventAfterCombat = false;
        }

        SceneChanger.switchToCombatScene(encounter);
    }

    /**
     * Post-combat card rewards are dead (Amendment: Soldier Levels &
     * Promotions supersedes them) — cards are now doled out at promotion,
     * not after every fight. Kept as an empty-array method rather than
     * deleted so CombatUiManager.determineRewards() (owned by another
     * agent) needs no changes: it already skips the reward screen when the
     * array is empty.
     */
    public getRewardsForCurrentCombat(): AbstractReward[] {
        return [];
    }

    /** Called when the player clicks Continue/Return after a won combat. */
    public advance(): void {
        if (!this.activeContract) return;

        // XP for the win to every deployed soldier still standing (design
        // doc: "wounded still earn it; the dead do not").
        const baseXp = xpForCombatWin(this.activeContract.act);
        // Standing Orders (e.g. converted Abyssal Research Institute) can
        // scale the combat-win XP.
        const orderAdjustedXp = StandingOrdersState.getInstance().xpGain(baseXp);
        this.squad.forEach(character => {
            if (character.hitpoints > 0 && !character.isDeceased) {
                character.xp += orderAdjustedXp;
            }
        });

        this.combatsCompleted++;
        if (this.combatsRemaining() > 0) {
            this.launchNextCombat();
        } else {
            this.resolveSortie();
        }
    }

    /** The whole squad went down: no payout, the roster pays the price. */
    public handleSquadWipe(): void {
        if (!this.activeContract) return;
        const contract = this.activeContract;
        const campaign = CampaignUiState.getInstance();
        const report: string[] = [
            `Contract "${contract.name}" FAILED. The squad did not return.`
        ];

        // Cargo cards are sortie-scoped only and must never reach a save
        // (see Contract.cratesLoaded doc) — strip them before anything else,
        // even though the squad is about to leave the roster entirely (they
        // died hauling it; the crates are as lost as the contract).
        stripCargoFromSquad(this.squad);

        this.squad.forEach(character => {
            character.isDeceased = true;
            campaign.roster = campaign.roster.filter(c => c !== character);
            report.push(`${character.name}: lost in the field.`);
            this.settleEquipmentForCasualty(character, report);
        });

        // Underwriting Retainer (wipe insurance, faction_reputation_design.md
        // "NEW HOOK (wipe insurance)"): the Company recovers a fraction of
        // the failed contract's payout. 0 unless that client's retainer is
        // active.
        const insurancePayout = StandingOrdersState.getInstance().wipeInsurancePayout(contract.payout);
        if (insurancePayout > 0) {
            GameState.getInstance().moneyInVault += insurancePayout;
            report.push(`Indemnity settlement received: £${insurancePayout}. The underwriters regret your loss.`);
        }

        // Ossuary Death Benefit retainer: every squad-wipe death is still a
        // Company death, so it pays out here too (house rule 6 — no special
        // case exempting a wipe from the same per-death benefit resolveSortie
        // pays for ordinary casualties).
        const deathBenefitTotal = StandingOrdersState.getInstance().deathBenefitPerCasualty() * this.squad.length;
        if (deathBenefitTotal > 0) {
            GameState.getInstance().moneyInVault += deathBenefitTotal;
            report.push(`Casualty benefit remitted: £${deathBenefitTotal}. The Company thanks the deceased for their custom.`);
        }

        // Ruling (Capital Works Rebuild Batch C, recorded in the amendment's
        // Rulings section): a wipe on a Recovery contract's OWN sortie
        // forfeits its escrowed souls immediately — no re-post; escrowed
        // souls must never outlive their contract. Runs through the same
        // shared forfeit path as the deadline lapse
        // (CampaignUiState.forfeitEscrowForContract), so probate fires now
        // if owned. The wiped squad's OWN deaths keep the witness rule
        // exactly as above — no escrow, no probate for them.
        if (contract.recoveryOfSouls && contract.recoveryOfSouls.length > 0) {
            const writeOffMessage = campaign.forfeitEscrowForContract(contract.name,
                names => `The escrow on ${names} is voided with the party sent to recover it. The Court writes off the collateral twice over.`);
            if (writeOffMessage) {
                report.push(writeOffMessage);
            }
        }

        // The squad's carried consumables go down with them — lost, not
        // returned to campaign stock. Same for whatever's left in
        // relicsInventory: settleEquipmentForCasualty already pulled insured
        // equipped relics out into the armoury above, so anything still here
        // is either an uninsured equipped relic or a mid-sortie acquisition —
        // both lost with the squad per design (relic_equipment_design.md).
        GameState.getInstance().currentRunCharacters = [];
        GameState.getInstance().consumables = [];
        GameState.getInstance().relicsInventory = [];
        campaign.selectedParty = [];
        this.activeContract = null;
        this.squad = [];
        this.combatsCompleted = 0;

        campaign.advanceWeeks(contract.durationWeeks);
        this.lastSortieReport = report;
        this.hasUnviewedReport = true;

        PlaytestJournal.getInstance().record('sortie_resolved', { outcome: 'wipe', contractType: contract.type, act: contract.act, casualties: this.squad.map(c => c.name), wounds: [], xpGained: 0, insurancePayout, deathBenefitTotal });

        SceneChanger.switchToCampaignScene();
    }

    /**
     * Settles a dead character's equipped relics (src/docs/relic_equipment_design.md):
     * insured ones return to the armoury (insurance consumed, a debrief line
     * recorded) and are pulled out of the combat inventory; uninsured ones
     * are simply dropped from the character's slots and left in
     * relicsInventory for the caller to deal with as "lost" (resolveSortie
     * banks it, handleSquadWipe discards it — see each call site's own
     * comment on why they differ). Shared between both death paths so the
     * insured/uninsured split logic exists exactly once (house rule 6).
     */
    private settleEquipmentForCasualty(character: PlayerCharacter, report: string[]): void {
        const campaign = CampaignUiState.getInstance();
        const gameState = GameState.getInstance();

        character.equippedRelics.forEach(relic => {
            const insured = character.insuredRelics.includes(relic);
            gameState.relicsInventory = gameState.relicsInventory.filter(r => r !== relic);
            if (insured) {
                campaign.armoury.push(relic);
                report.push(`${character.name}'s ${relic.getDisplayName()} recovered under the Company's underwriting policy.`);
            } else {
                report.push(`${character.name}'s ${relic.getDisplayName()} is lost with them, uninsured.`);
            }
        });
        character.equippedRelics = [];
        character.insuredRelics = [];
    }

    private resolveSortie(): void {
        const contract = this.activeContract!;
        const gameState = GameState.getInstance();
        const campaign = CampaignUiState.getInstance();
        const report: string[] = [];

        // Trade runs bank base + freight; combat contracts have cratesLoaded
        // 0 so projectedPayout collapses to the plain payout. Prestige
        // Commissions always project to £0 (payout is always 0 on these) —
        // handled as its own report line below rather than a "£0 banked"
        // line, which would read as a bug rather than the intended trade.
        const totalPayout = contract.projectedPayout;
        gameState.moneyInVault += totalPayout;
        campaign.contractsCompleted++;
        campaign.contractsCompletedByClient[contract.client] =
            (campaign.contractsCompletedByClient[contract.client] ?? 0) + 1;
        if (contract.isPrestige) {
            campaign.charterVictoryPoints += contract.vpReward;
            report.push(`Contract "${contract.name}" fulfilled: ${contract.vpReward} VP banked. ` +
                `The Court of Directors notes its satisfaction. It does not pay in anything so vulgar as money.`);
        } else if (contract.isTradeRun && contract.cratesLoaded > 0) {
            report.push(`Contract "${contract.name}" fulfilled: £${contract.payout} base + `
                + `${contract.cratesLoaded} crate(s) x £${contract.freightRatePerCrate} freight = £${totalPayout} banked.`);
        } else {
            report.push(`Contract "${contract.name}" fulfilled: £${totalPayout} banked.`);
        }

        // Provisioning grant, if this contract carried one. Recorded as a
        // name only (house rule 1 — see pendingConsumableRewardName doc);
        // the HQ UI layer performs the actual grant/resale after this method
        // returns, since it alone may import ConsumablesLibrary.
        this.pendingConsumableRewardName = contract.consumableRewardName ?? null;
        if (this.pendingConsumableRewardName) {
            report.push(`Provisioning grant included: ${this.pendingConsumableRewardName}.`);
        }

        // Capital Works Rebuild (July 2026): fire the per-contract-completed
        // hook for every owned project (The Company Gazette's VP drip is the
        // only current consumer). SUCCESS path only — handleSquadWipe never
        // calls resolveSortie, so a wipe never fires this.
        campaign.ownedStrategicProjects.forEach(project => project.onContractCompleted(contract));

        // Time passes first (the sortie took this long); wounds sustained on
        // this sortie are applied after, so they don't tick during it.
        campaign.advanceWeeks(contract.durationWeeks);

        // Escrow redemption (Soul Collateral Office, Capital Works Rebuild
        // Batch C): a completed Recovery of Company Assets contract returns
        // its souls to the roster — over the roster cap if need be (ruling)
        // — wounded, shaken, and on the books. Placed AFTER advanceWeeks for
        // the same reason wounds are: the recovery wound must not tick down
        // during the sortie that inflicted it. Names not found in escrow are
        // skipped gracefully.
        if (contract.recoveryOfSouls && contract.recoveryOfSouls.length > 0) {
            const recovered: string[] = [];
            contract.recoveryOfSouls.forEach(name => {
                const entryIdx = campaign.escrowedSouls.findIndex(e => e.soldier.name === name);
                if (entryIdx < 0) return;
                const [entry] = campaign.escrowedSouls.splice(entryIdx, 1);
                const soldier = entry.soldier;
                soldier.isDeceased = false;
                soldier.hitpoints = soldier.maxHitpoints;
                soldier.weeksWoundedRemaining = ESCROW_RECOVERY_WOUND_WEEKS;
                const stressBuff = soldier.buffs.find(b => b.id === "stress");
                if (stressBuff) {
                    stressBuff.stacks += ESCROW_RECOVERY_STRESS;
                } else {
                    soldier.buffs.push(new Stress(ESCROW_RECOVERY_STRESS));
                }
                campaign.roster.push(soldier);
                recovered.push(name);
            });
            if (recovered.length > 0) {
                report.push(`The Soul Collateral Office releases ${recovered.join(', ')} from escrow: `
                    + `wounded ${ESCROW_RECOVERY_WOUND_WEEKS} weeks, considerably shaken, and re-entered on the Company's books.`);
            }
        }

        // Playtest telemetry baselines (consumable/relic counts before
        // resolution's transfers below move them around) so the eventual
        // sortie_resolved record can report net deltas.
        const consumablesBefore = campaign.consumables.length;
        const armouryBefore = campaign.armoury.length;

        // Casualties and wounds come home with the squad.
        const casualties = applyCasualties(this.squad);
        casualties.deaths.forEach(dead => {
            campaign.roster = campaign.roster.filter(c => c !== dead);
        });
        report.push(...casualties.lines);

        // Per-soldier equipment loss (src/docs/relic_equipment_design.md,
        // "Individual death on a won sortie: same per-soldier rule" as a
        // wipe). applyCasualties just set isDeceased on the objects in
        // this.squad (they satisfy CasualtySubject structurally, so it
        // mutates the real PlayerCharacter instances) — filter on that
        // rather than casualties.deaths, which is typed as the narrower
        // interface and loses the relic fields.
        this.squad
            .filter(character => character.isDeceased)
            .forEach(character => {
                this.settleEquipmentForCasualty(character, report);
            });

        // Ossuary Death Benefit retainer (faction_reputation_design.md "NEW
        // HOOK (death benefit)"): £ credited to the vault per Company death
        // this sortie. 0 unless that client's retainer is active.
        if (casualties.deaths.length > 0) {
            const deathBenefitTotal = StandingOrdersState.getInstance().deathBenefitPerCasualty() * casualties.deaths.length;
            if (deathBenefitTotal > 0) {
                gameState.moneyInVault += deathBenefitTotal;
                report.push(`Casualty benefit remitted: £${deathBenefitTotal}. The Company thanks the deceased for their custom.`);
            }
        }

        // Death settlement (Capital Works Rebuild Batch C): the pure plan
        // (DeathSettlement.settleDeaths) decides escrow vs probate vs
        // permanent loss; this block only applies it. Ordering rulings
        // honored here: relics of the dead settled ABOVE, exactly as before
        // (the soul comes back, the kit doesn't), and this runs AFTER
        // advanceWeeks so a posted recovery contract never ages before it
        // appears. resolveSortie is the won-sortie path, so squadWiped is
        // false by construction (wipes take handleSquadWipe, which never
        // consults the plan — witness rule).
        if (casualties.deaths.length > 0) {
            const plan = settleDeaths({
                soulCollateralOwned: campaign.ownsProject(new SoulCollateralOffice().name),
                probateOwned: campaign.ownsProject(new ProbateAndEffectsOffice().name),
                squadWiped: false,
                deaths: casualties.deaths.map(d => d.name),
            });

            if (plan.postRecoveryContract && plan.escrow.length > 0) {
                const recovery = ContractGenerator.getInstance().generateRecoveryContract(plan.escrow, contract.act);
                this.squad
                    .filter(c => plan.escrow.includes(c.name))
                    .forEach(soldier => campaign.escrowedSouls.push({ soldier, contractName: recovery.name }));
                campaign.availableContracts.push(recovery);
                report.push(`The Soul Collateral Office enters ${plan.escrow.join(', ')} into escrow. A recovery commission is posted.`);
            }

            plan.archiveCardsOf.forEach(name => {
                const soldier = this.squad.find(c => c.name === name);
                if (!soldier) return;
                const archived = campaign.archiveEffectsOf(soldier);
                if (archived > 0) {
                    report.push(`The Probate & Effects Office enters ${archived} card(s) from ${name}'s effects into the Company Archive.`);
                }
            });
        }

        // Decks persist between sorties by design; only combat-scoped state
        // clears. Stress comes home with the soldier (Darkest-Dungeon-style)
        // and decays at HQ — see CampaignUiState.advanceWeeks.
        this.squad.forEach(character => {
            character.buffs = character.buffs.filter(
                buff => buff.isPersonaTrait || buff.id === "stress"
            );
        });
        // Cargo cards are sortie-scoped only (spec: "no SaveRegistries entry
        // is needed" because they can never persist) — strip them back out
        // of the squad's decks now, win or lose is irrelevant here since a
        // squad wipe takes the separate handleSquadWipe path below, which
        // strips independently.
        stripCargoFromSquad(this.squad);
        gameState.currentRunCharacters = [];
        campaign.selectedParty = [];

        // Unused consumables come home: transfer ownership back to campaign
        // stock (move, not copy — GameState.consumables is the sortie-scoped
        // loadout and must end the sortie empty). Clamp to the stock cap,
        // keeping campaign items first and dropping overflow from the end
        // (the debug-only test tool can overfill the loadout; normal play
        // cannot).
        campaign.consumables = mergeStockWithLoadout(campaign.consumables, gameState.consumables, campaign.getConsumableStockCap());
        gameState.consumables = [];

        // Equipped relics on living soldiers return to their slots (they
        // never really left — just remove them from the combat inventory);
        // dead soldiers already had theirs settled above. Anything left in
        // relicsInventory after that is a mid-sortie acquisition (event/shop)
        // and banks to the armoury. Living-soldier pass must run before dead
        // soldiers' relics (already removed from equippedRelics by
        // settleEquipmentForCasualty) so this loop only sees survivors' gear.
        this.squad
            .filter(character => !character.isDeceased)
            .forEach(character => {
                character.equippedRelics.forEach(relic => {
                    gameState.relicsInventory = gameState.relicsInventory.filter(r => r !== relic);
                });
            });
        campaign.armoury.push(...gameState.relicsInventory);
        gameState.relicsInventory = [];

        this.activeContract = null;
        this.squad = [];
        this.combatsCompleted = 0;

        this.lastSortieReport = [...report, ...campaign.calendar.boardEvents
            .filter(e => e.week > campaign.calendar.week - contract.durationWeeks)
            .map(e => e.message)];
        this.hasUnviewedReport = true;

        PlaytestJournal.getInstance().record('sortie_resolved', { outcome: 'success', contractType: contract.type, act: contract.act, payout: totalPayout, casualties: casualties.deaths.map(d => d.name), wounds: casualties.wounds.map(w => ({ name: w.subject.name, weeks: w.weeks })), consumableDelta: campaign.consumables.length - consumablesBefore, relicDelta: campaign.armoury.length - armouryBefore });

        SceneChanger.switchToCampaignScene();
    }
}
