import { CampaignCalendar } from '../../../campaign/CampaignCalendar';
import { Contract } from '../../../campaign/Contract';
import { ContractGenerator } from '../../../campaign/ContractGenerator';
import { StandingOrdersState } from '../../../campaign/orders/StandingOrdersState';
import { CharacterGenerator } from '../../../gamecharacters/CharacterGenerator';
import { PlayerCharacter } from '../../../gamecharacters/PlayerCharacter';
import { CampaignRules } from '../../../rules/CampaignRulesHelper';
import { GameState } from '../../../rules/GameState';
import { AbstractStrategicProject } from '../../../strategic_projects/AbstractStrategicProject';
import { PURCHASABLE_STRATEGIC_PROJECTS } from '../../../strategic_projects/StrategicProjectList';

export const ROSTER_CAP = 8;
export const RECRUIT_COST = 80;
const RECRUIT_POOL_SIZE = 3;

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

    /**
     * Advance campaign time: settle dividends from the vault, tick wounds,
     * expire stale contracts, and top the board back up.
     */
    public advanceWeeks(n: number): void {
        const gameState = GameState.getInstance();

        this.calendar.advanceWeeks(n, (amountDue: number) => {
            // Project income (bonds, embassies) lands before the dividend is settled.
            this.ownedStrategicProjects.forEach(project => project.onQuarterEnd());
            const paid = Math.min(amountDue, gameState.moneyInVault);
            gameState.moneyInVault -= paid;
            return paid;
        });

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