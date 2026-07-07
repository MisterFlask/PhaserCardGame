import { CampaignCalendar, WAGE_PER_SOLDIER_PER_QUARTER } from '../../../campaign/CampaignCalendar';
import { Contract } from '../../../campaign/Contract';
import { ContractGenerator } from '../../../campaign/ContractGenerator';
import { MAX_CONSUMABLE_STOCK } from '../../../campaign/ConsumableStock';
import { StandingOrdersState } from '../../../campaign/orders/StandingOrdersState';
import { AbstractConsumable } from '../../../consumables/AbstractConsumable';
import { CharacterGenerator } from '../../../gamecharacters/CharacterGenerator';
import { PlayerCharacter } from '../../../gamecharacters/PlayerCharacter';
import { CampaignRules } from '../../../rules/CampaignRulesHelper';
import { GameState } from '../../../rules/GameState';
import { AbstractStrategicProject } from '../../../strategic_projects/AbstractStrategicProject';
import { CompanySecretariat } from '../../../strategic_projects/CompanySecretariat';
import { PURCHASABLE_STRATEGIC_PROJECTS } from '../../../strategic_projects/StrategicProjectList';

export const ROSTER_CAP = 8;
export const RECRUIT_COST = 80;
const RECRUIT_POOL_SIZE = 3;

/** Contracts fulfilled for the same client before their retainer Standing
 *  Order unlocks (design doc, "Amendment: Standing Orders" -> "Where orders
 *  come from" -> "future hook"). */
export const CLIENT_RETAINER_UNLOCK_THRESHOLD = 3;

/**
 * Maps a contract client string (Contract.client, e.g. "The Styx Dam Project
 * Office") to the Standing Order id it unlocks after
 * CLIENT_RETAINER_UNLOCK_THRESHOLD completed contracts for that client.
 *
 * INTENTIONALLY EMPTY at present: the design amendment names this mechanism
 * as a "future hook" and gives exactly one illustrative example ("fulfil
 * three Infernal Marine contracts -> Underwriting Retainer") using a client
 * name that does not match any client in ContractGenerator.ts's actual
 * REGION_FLAVORS/TRADE_RUN_REGIONS tables. Which of the twelve real clients
 * get bespoke retainer orders, and what those orders do, is an unresolved
 * design decision (see TODO.md "Faction reputation + intelligence services"
 * — flagged as its own design session). The tracking/unlock/UI mechanism
 * below is fully wired and ready; populate this map (and register the
 * corresponding StandingOrder subclasses in LaunchOrders.ts) once that
 * design pass happens. House rule 6: this registry is the only place a
 * client-to-order mapping may live — no per-client branches elsewhere.
 */
export const CLIENT_RETAINER_ORDER_IDS: Record<string, string> = {};

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
                .refillBoard(this.availableContracts, this.calendar.year, this.contractsCompleted);
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
     * Advance campaign time: settle dividends from the vault, tick wounds,
     * expire stale contracts, and top the board back up.
     */
    public advanceWeeks(n: number): void {
        const gameState = GameState.getInstance();

        this.calendar.advanceWeeks(
            n,
            (amountDue: number) => {
                // Dividend draw: whatever the vault still holds after income
                // and wages have settled.
                const paid = Math.min(amountDue, gameState.moneyInVault);
                gameState.moneyInVault -= paid;
                return paid;
            },
            () => this.roster.length * WAGE_PER_SOLDIER_PER_QUARTER,
            (amountDue: number) => {
                // Wages settle before the dividend draw; the vault floors at 0
                // (never negative) and any shortfall is absorbed by the
                // existing dividend-shortfall consequences, not a new penalty.
                const paid = Math.min(amountDue, gameState.moneyInVault);
                gameState.moneyInVault -= paid;
                return paid;
            },
            () => {
                // Project income (bonds, embassies) lands at the top of the
                // board meeting — before wages and the dividend — so money
                // arriving that quarter can pay that quarter's bills.
                this.ownedStrategicProjects.forEach(project => project.onQuarterEnd());
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
            .refillBoard(this.availableContracts, this.calendar.year, this.contractsCompleted);

        // A fresh crop of hopefuls drifts through the recruitment office.
        this.recruitCandidates = [];
        this.ensureRecruitsPopulated();
    }
} 