import { CampaignCalendar, WAGE_PER_SOLDIER_PER_QUARTER } from '../../../campaign/CampaignCalendar';
import { Contract } from '../../../campaign/Contract';
import { ContractGenerator } from '../../../campaign/ContractGenerator';
import { MAX_CONSUMABLE_STOCK } from '../../../campaign/ConsumableStock';
import { relicSlots } from '../../../campaign/Leveling';
import { _wireRetainerUnlockCheck, StandingOrdersState } from '../../../campaign/orders/StandingOrdersState';
import { AbstractConsumable } from '../../../consumables/AbstractConsumable';
import { CharacterGenerator } from '../../../gamecharacters/CharacterGenerator';
import { PlayerCharacter } from '../../../gamecharacters/PlayerCharacter';
import { AbstractRelic } from '../../../relics/AbstractRelic';
import { EmergencyTeleporter } from '../../../relics/special/EmergencyTeleporter';
import { CampaignRules } from '../../../rules/CampaignRulesHelper';
import { GameState } from '../../../rules/GameState';
import { AbstractStrategicProject } from '../../../strategic_projects/AbstractStrategicProject';
import { CompanySecretariat } from '../../../strategic_projects/CompanySecretariat';
import { PURCHASABLE_STRATEGIC_PROJECTS } from '../../../strategic_projects/StrategicProjectList';
import { PlaytestJournal } from '../../../utils/PlaytestJournal';

/** £ cost to underwrite one equipped relic against loss (one-time, per relic). */
export const RELIC_INSURANCE_COST = 40;

export const ROSTER_CAP = 8;
export const RECRUIT_COST = 80;
const RECRUIT_POOL_SIZE = 3;

/** Charter Buyback (src/docs/vp_endgame_design.md): from year 8, the
 *  Investment panel's RETIRE SHARES row converts £ into VP at this rate,
 *  repeatable, irreversible. "1.3:1 beats hoarding by exactly 30% — strong
 *  enough to force the decision, weak enough that solvency still dominates
 *  mid-game" (design doc). */
export const CHARTER_BUYBACK_MONEY_COST = 100;
export const CHARTER_BUYBACK_VP_REWARD = 130;
/** Final charter year (of CHARTER_YEARS) the buyback becomes available:
 *  "final 8 quarters" = the last 2 years of a 10-year charter. */
export const CHARTER_BUYBACK_MIN_YEAR = 8;

/** Contracts fulfilled for the same client before their retainer Standing
 *  Order unlocks (design doc, "Amendment: Standing Orders" -> "Where orders
 *  come from" -> "future hook"). */
export const CLIENT_RETAINER_UNLOCK_THRESHOLD = 3;

/**
 * Maps a contract client string (Contract.client, e.g. "The Styx Dam Project
 * Office") to the Standing Order id it unlocks after
 * CLIENT_RETAINER_UNLOCK_THRESHOLD completed contracts for that client.
 * Client strings must match ContractGenerator's templates byte-for-byte —
 * enforced by ClientReputation.test.ts. House rule 6: this registry is the
 * only place a client-to-order mapping may live — no per-client branches
 * elsewhere. Canon and per-order specs: src/docs/faction_reputation_design.md
 * ("Retainer canon"); order classes live in
 * src/campaign/orders/ClientRetainerOrders.ts.
 */
export const CLIENT_RETAINER_ORDER_IDS: Record<string, string> = {
    "The Styx Dam Project Office": "civil-works-schedule",
    "Infernal Marine & Postal Underwriters, Ltd.": "underwriting-retainer",
    "Styx Delta Ferry & Lighterage Company": "preferred-lading-rates",
    "Maison Vachon, Purveyors to the Front": "officers-mess-account",
    "Brimstone Barons Equipment Leasing Consortium": "plant-and-equipment-lease",
    "Continental Casualty & Ossuary Underwriters": "ossuary-death-benefit",
};

// Wires StandingOrdersState's gated registry view to the live unlock check
// (see StandingOrdersState._wireRetainerUnlockCheck doc: it can't import
// CampaignUiState directly without a load cycle, since CampaignUiState
// imports ContractGenerator, which imports StandingOrdersState). Module-init
// side effect, deliberately narrow — this is the one seam where the two
// modules touch.
_wireRetainerUnlockCheck((orderId: string) => {
    const client = Object.keys(CLIENT_RETAINER_ORDER_IDS).find(c => CLIENT_RETAINER_ORDER_IDS[c] === orderId);
    if (!client) return true; // not a client-retainer order id; nothing to gate
    return CampaignUiState.getInstance().isClientRetainerUnlocked(client);
});

export class CampaignUiState {
    private static instance: CampaignUiState;

    // --- XCOM-style strategic layer (see src/docs/strategic_layer_redesign.md) ---
    public calendar: CampaignCalendar = new CampaignCalendar();
    public availableContracts: Contract[] = [];
    public selectedContract: Contract | null = null;
    public ownedStrategicProjects: AbstractStrategicProject[] = [];
    public availableStrategicProjects: AbstractStrategicProject[] = PURCHASABLE_STRATEGIC_PROJECTS;
    public selectedParty: PlayerCharacter[] = [];
    public roster: PlayerCharacter[] = CampaignRules.getInstance().generateLogicalCharacterRoster();
    /** Hireable candidates at the Barracks; refreshed as weeks pass. */
    public recruitCandidates: PlayerCharacter[] = [];
    /** Campaign stat, shown on the end-of-campaign screen. */
    public contractsCompleted: number = 0;
    /** Per-client completion count, keyed by Contract.client. The one owner
     *  of this fact (house rule 3); SortieManager.resolveSortie increments
     *  it alongside contractsCompleted. Drives client-unlocked retainer
     *  Standing Orders (see CLIENT_RETAINER_ORDER_IDS). */
    public contractsCompletedByClient: Record<string, number> = {};
    /** Canonical owned consumable stock — the one owner of this fact
     *  (house rule 3). SortieManager transfers these into GameState.consumables
     *  (the active loadout) on dispatch and back on successful resolution. */
    public consumables: AbstractConsumable[] = [];
    /** VP earned outside strategic projects: Prestige Commissions
     *  (SortieManager.resolveSortie) and Charter Buyback (retireSharesForVp
     *  below). The one owner of this fact (house rule 3). Final score =
     *  projects VP + charterVictoryPoints + vault (EndOfCampaignPanel). See
     *  src/docs/vp_endgame_design.md. */
    public charterVictoryPoints: number = 0;
    /** The Company's owned, unassigned relics (src/docs/relic_equipment_design.md).
     *  The one owner of this fact (house rule 3). SortieManager transfers
     *  deployed soldiers' equipped relics into GameState.relicsInventory on
     *  dispatch and banks newly-acquired ones back here on resolution.
     *  Starts with the EmergencyTeleporter that used to seed
     *  GameState.relicsInventory every run (see GameState.initializeRun). */
    public armoury: AbstractRelic[] = [new EmergencyTeleporter()];

    private constructor() {}

    public static getInstance(): CampaignUiState {
        if (!CampaignUiState.instance) {
            CampaignUiState.instance = new CampaignUiState();
        }
        return CampaignUiState.instance;
    }

    public getCurrentFunds(): number {
        return GameState.getInstance().moneyInVault;
    }

    public getShareholderSatisfaction(): number {
        return this.calendar.shareholderSatisfaction;
    }

    /** Populate the contract board if empty (call when the HQ opens). */
    public ensureContractsPopulated(): void {
        if (this.availableContracts.length === 0) {
            this.availableContracts = ContractGenerator.getInstance()
                .refillBoard(this.availableContracts, this.calendar.year, this.contractsCompleted, 5, this.contractsCompletedByClient);
        }
    }

    public ensureRecruitsPopulated(): void {
        while (this.recruitCandidates.length < RECRUIT_POOL_SIZE) {
            this.recruitCandidates.push(CharacterGenerator.getInstance().generateRandomCharacter());
        }
    }

    public ownsProject(name: string): boolean {
        return this.ownedStrategicProjects.some(p => p.name === name);
    }

    /**
     * Recomputes StandingOrdersState.bonusSlots from currently owned Capital
     * Works. A resync rather than an increment: AbstractStrategicProject has
     * no onPurchase hook and onQuarterEnd fires every quarter (which would
     * double-count a stored increment), so bonusSlots is derived fresh each
     * time ownership might have changed. Call after a purchase and after a
     * save load. Additive with future bonus-slot-granting Capital Works —
     * extend the sum here, not with an if-this-project branch elsewhere.
     */
    public syncStandingOrderBonusSlots(): void {
        const secretariatBonus = this.ownsProject(new CompanySecretariat().name) ? 1 : 0;
        StandingOrdersState.getInstance().bonusSlots = secretariatBonus;
    }

    /** True once CLIENT_RETAINER_UNLOCK_THRESHOLD contracts have been
     *  fulfilled for the given client. Used by the ratification UI to grey
     *  out a not-yet-unlocked retainer order row. */
    public isClientRetainerUnlocked(client: string): boolean {
        return (this.contractsCompletedByClient[client] ?? 0) >= CLIENT_RETAINER_UNLOCK_THRESHOLD;
    }

    /** RECRUIT_COST adjusted by any active Standing Orders (e.g. Recruiting Sergeants). */
    public getRecruitCost(): number {
        return StandingOrdersState.getInstance().recruitCost(RECRUIT_COST);
    }

    /** A base therapy £ figure adjusted by any active Standing Orders (e.g.
     *  Accredited Phrenology Retainer). The base cost itself lives with the
     *  caller (BarracksPanel) since it's UI-owned. */
    public getTherapyCost(base: number): number {
        return StandingOrdersState.getInstance().therapyCost(base);
    }

    /**
     * Hire a candidate onto the roster. Returns false (and does nothing) if
     * the vault or the barracks can't take it.
     */
    public hireRecruit(candidate: PlayerCharacter): boolean {
        const gameState = GameState.getInstance();
        const cost = this.getRecruitCost();
        if (gameState.moneyInVault < cost) return false;
        if (this.roster.length >= ROSTER_CAP) return false;
        if (!this.recruitCandidates.includes(candidate)) return false;

        gameState.moneyInVault -= cost;
        this.roster.push(candidate);
        this.recruitCandidates = this.recruitCandidates.filter(c => c !== candidate);
        this.ensureRecruitsPopulated();
        return true;
    }

    /** True when owned stock is at the shared cap; purchases and grants are
     *  blocked/redirected once this holds. */
    public isConsumableStockFull(): boolean {
        return this.consumables.length >= MAX_CONSUMABLE_STOCK;
    }

    /**
     * Purchase a consumable for the Quartermaster's price, adding it to
     * campaign stock. Returns false (and does nothing) if the vault can't
     * cover it or stock is already at cap.
     */
    public purchaseConsumable(consumable: AbstractConsumable, price: number): boolean {
        const gameState = GameState.getInstance();
        if (this.isConsumableStockFull()) return false;
        if (gameState.moneyInVault < price) return false;

        gameState.moneyInVault -= price;
        consumable.init();
        consumable.onPurchase();
        this.consumables.push(consumable);
        return true;
    }

    /**
     * Equip an armoury relic onto a soldier's slot. Returns false (and does
     * nothing) if the relic isn't in the armoury or the soldier's slots
     * (Leveling.relicSlots(level)) are already full.
     */
    public equipRelic(soldier: PlayerCharacter, relic: AbstractRelic): boolean {
        if (!this.armoury.includes(relic)) return false;
        if (soldier.equippedRelics.length >= relicSlots(soldier.level)) return false;

        this.armoury = this.armoury.filter(r => r !== relic);
        soldier.equippedRelics.push(relic);
        return true;
    }

    /** Unequip a soldier's relic back to the armoury. Insurance lapses
     *  (there's nothing left to underwrite once it's not deployed) — the
     *  Company doesn't refund the premium; re-insure on next equip. */
    public unequipRelic(soldier: PlayerCharacter, relic: AbstractRelic): boolean {
        if (!soldier.equippedRelics.includes(relic)) return false;

        soldier.equippedRelics = soldier.equippedRelics.filter(r => r !== relic);
        soldier.insuredRelics = soldier.insuredRelics.filter(r => r !== relic);
        this.armoury.push(relic);
        return true;
    }

    /**
     * Underwrite an equipped, not-yet-insured relic for RELIC_INSURANCE_COST.
     * Returns false (and does nothing) if the vault can't cover it, the
     * relic isn't equipped on this soldier, or it's already insured.
     */
    public insureRelic(soldier: PlayerCharacter, relic: AbstractRelic): boolean {
        if (!soldier.equippedRelics.includes(relic)) return false;
        if (soldier.insuredRelics.includes(relic)) return false;
        const gameState = GameState.getInstance();
        if (gameState.moneyInVault < RELIC_INSURANCE_COST) return false;

        gameState.moneyInVault -= RELIC_INSURANCE_COST;
        soldier.insuredRelics.push(relic);
        return true;
    }

    /** True from calendar year CHARTER_BUYBACK_MIN_YEAR onward: the
     *  Investment panel's RETIRE SHARES row (Charter Buyback) only trades
     *  once the charter's final years are underway (design doc: "converting
     *  too early gets you sacked"). */
    public isCharterBuybackUnlocked(): boolean {
        return this.calendar.year >= CHARTER_BUYBACK_MIN_YEAR;
    }

    /**
     * Charter Buyback (RETIRE SHARES): convert one £100 block into 130 VP,
     * irreversible. Returns false (and does nothing) if the buyback isn't
     * unlocked yet or the vault can't cover a block. Money retired this way
     * cannot cover dividends — the whole point of the late-charter trade.
     */
    public retireSharesForVp(): boolean {
        const gameState = GameState.getInstance();
        if (!this.isCharterBuybackUnlocked()) return false;
        if (gameState.moneyInVault < CHARTER_BUYBACK_MONEY_COST) return false;

        gameState.moneyInVault -= CHARTER_BUYBACK_MONEY_COST;
        this.charterVictoryPoints += CHARTER_BUYBACK_VP_REWARD;
        this.calendar.boardEvents.push({
            week: this.calendar.week,
            message: `The Court retires £${CHARTER_BUYBACK_MONEY_COST} of working capital as ${CHARTER_BUYBACK_VP_REWARD} shares of` +
                ` charter prestige. Running total: ${this.charterVictoryPoints} VP.`,
            isWarning: false,
        });
        return true;
    }

    /**
     * Advance campaign time: settle dividends from the vault, tick wounds,
     * expire stale contracts, and top the board back up.
     */
    public advanceWeeks(n: number): void {
        const gameState = GameState.getInstance();
        // Playtest telemetry accumulators for the current board meeting, if
        // any (advanceWeeks' onBoardMeetingStart/wages/dividend callbacks run
        // income -> wages -> dividend, in that order, once per quarter
        // boundary crossed — see CampaignCalendar.settleDividend doc).
        let meetingVaultBeforeIncome = gameState.moneyInVault;
        let meetingIncome = 0;
        let meetingWagesPaid = 0;

        this.calendar.advanceWeeks(
            n,
            (amountDue: number) => {
                // Dividend draw: whatever the vault still holds after income
                // and wages have settled.
                const paid = Math.min(amountDue, gameState.moneyInVault);
                gameState.moneyInVault -= paid;
                PlaytestJournal.getInstance().record('board_meeting_settled', { year: this.calendar.year, quarter: this.calendar.quarterOfYear, income: meetingIncome, wagesPaid: meetingWagesPaid, dividendDue: amountDue, dividendPaid: paid, satisfactionAfter: this.calendar.shareholderSatisfaction });
                meetingVaultBeforeIncome = gameState.moneyInVault;
                meetingIncome = 0;
                meetingWagesPaid = 0;
                return paid;
            },
            () => this.roster.length * WAGE_PER_SOLDIER_PER_QUARTER,
            (amountDue: number) => {
                // Wages settle before the dividend draw; the vault floors at 0
                // (never negative) and any shortfall is absorbed by the
                // existing dividend-shortfall consequences, not a new penalty.
                const paid = Math.min(amountDue, gameState.moneyInVault);
                gameState.moneyInVault -= paid;
                meetingWagesPaid = paid;
                return paid;
            },
            () => {
                // Project income (bonds, embassies) lands at the top of the
                // board meeting — before wages and the dividend — so money
                // arriving that quarter can pay that quarter's bills.
                meetingVaultBeforeIncome = gameState.moneyInVault;
                this.ownedStrategicProjects.forEach(project => project.onQuarterEnd());
                meetingIncome = gameState.moneyInVault - meetingVaultBeforeIncome;
            },
        );

        // Wounded soldiers recuperate; nerves settle slowly (1 stress/week).
        this.roster.forEach(character => {
            if (character.weeksWoundedRemaining > 0) {
                character.weeksWoundedRemaining = Math.max(0, character.weeksWoundedRemaining - n);
            }
            const stressBuff = character.buffs.find(b => b.id === "stress");
            if (stressBuff) {
                stressBuff.stacks = Math.max(0, stressBuff.stacks - n);
                if (stressBuff.stacks === 0) {
                    character.buffs = character.buffs.filter(b => b !== stressBuff);
                }
            }
        });

        // Contracts age off the board; fresh ones post.
        this.availableContracts.forEach(c => c.deadlineWeeks -= n);
        this.availableContracts = this.availableContracts.filter(c => c.deadlineWeeks > 0);
        this.availableContracts = ContractGenerator.getInstance()
            .refillBoard(this.availableContracts, this.calendar.year, this.contractsCompleted, 5, this.contractsCompletedByClient);

        // A fresh crop of hopefuls drifts through the recruitment office.
        this.recruitCandidates = [];
        this.ensureRecruitsPopulated();
    }
} 