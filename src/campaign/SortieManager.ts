import { EncounterManager } from "../encounters/EncounterManager";
import { EventsManager } from "../events/EventsManager";
import { injectCargoIntoSquad, stripCargoFromSquad } from "../gamecharacters/cargo/CargoInjection";
import { Lethality } from "../gamecharacters/buffs/standard/Lethality";
import { PlayerCharacter } from "../gamecharacters/PlayerCharacter";
import { AbstractReward } from "../rewards/AbstractReward";
import { GameState } from "../rules/GameState";
import { CampaignUiState } from "../screens/campaign/hq_ux/CampaignUiState";
import { SceneChanger } from "../screens/SceneChanger";
import { applyHpHardening, hardeningForYear } from "./EncounterHardening";
import { Contract } from "./Contract";
import { xpForCombatWin } from "./Leveling";
import { StandingOrdersState } from "./orders/StandingOrdersState";
import { applyCasualties } from "./SortieResolution";
import { mergeStockWithLoadout } from "./ConsumableStock";

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
        gameState.consumables = [...campaign.consumables];
        campaign.consumables = [];

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
        // "Hell escalates too — regions harden over time"). Narrative-event
        // combats (e.g. DutchZooEscape) spawn enemies via a different path
        // and are NOT covered by this — a known gap, not fixed here.
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
        // doc: "wounded still earn it; the dead do not"). The old ashes
        // payoff converts to bonus XP ONCE, at the sortie's final combat:
        // combatResources persist across a sortie's combats, so a
        // per-combat read would re-grant earlier combats' ashes.
        const baseXp = xpForCombatWin(this.activeContract.act);
        const isFinalCombat = this.combatsRemaining() <= 1;
        const bonusXp = isFinalCombat
            ? GameState.getInstance().combatState.combatResources.ashes.value
            : 0;
        // Standing Orders (e.g. converted Abyssal Research Institute) can
        // scale the combat-win XP; the ashes bonus is a flat carryover, not
        // itself scaled, to keep its accounting a simple 1:1 conversion.
        const orderAdjustedXp = StandingOrdersState.getInstance().xpGain(baseXp);
        this.squad.forEach(character => {
            if (character.hitpoints > 0 && !character.isDeceased) {
                character.xp += orderAdjustedXp + bonusXp;
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
        });

        // The squad's carried consumables go down with them — lost, not
        // returned to campaign stock.
        GameState.getInstance().currentRunCharacters = [];
        GameState.getInstance().consumables = [];
        campaign.selectedParty = [];
        this.activeContract = null;
        this.squad = [];
        this.combatsCompleted = 0;

        campaign.advanceWeeks(contract.durationWeeks);
        this.lastSortieReport = report;
        this.hasUnviewedReport = true;

        SceneChanger.switchToCampaignScene();
    }

    private resolveSortie(): void {
        const contract = this.activeContract!;
        const gameState = GameState.getInstance();
        const campaign = CampaignUiState.getInstance();
        const report: string[] = [];

        // Trade runs bank base + freight; combat contracts have cratesLoaded
        // 0 so projectedPayout collapses to the plain payout.
        const totalPayout = contract.projectedPayout;
        gameState.moneyInVault += totalPayout;
        campaign.contractsCompleted++;
        campaign.contractsCompletedByClient[contract.client] =
            (campaign.contractsCompletedByClient[contract.client] ?? 0) + 1;
        if (contract.isTradeRun && contract.cratesLoaded > 0) {
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

        // Time passes first (the sortie took this long); wounds sustained on
        // this sortie are applied after, so they don't tick during it.
        campaign.advanceWeeks(contract.durationWeeks);

        // Casualties and wounds come home with the squad.
        const casualties = applyCasualties(this.squad);
        casualties.deaths.forEach(dead => {
            campaign.roster = campaign.roster.filter(c => c !== dead);
        });
        report.push(...casualties.lines);

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
        campaign.consumables = mergeStockWithLoadout(campaign.consumables, gameState.consumables);
        gameState.consumables = [];

        this.activeContract = null;
        this.squad = [];
        this.combatsCompleted = 0;

        this.lastSortieReport = [...report, ...campaign.calendar.boardEvents
            .filter(e => e.week > campaign.calendar.week - contract.durationWeeks)
            .map(e => e.message)];
        this.hasUnviewedReport = true;

        SceneChanger.switchToCampaignScene();
    }
}
