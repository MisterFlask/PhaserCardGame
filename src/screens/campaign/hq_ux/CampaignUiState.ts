import { CampaignCalendar } from '../../../campaign/CampaignCalendar';
import { Contract } from '../../../campaign/Contract';
import { ContractGenerator } from '../../../campaign/ContractGenerator';
import { PlayerCharacter } from '../../../gamecharacters/PlayerCharacter';
import { CampaignRules } from '../../../rules/CampaignRulesHelper';
import { GameState } from '../../../rules/GameState';
import { AbstractStrategicProject } from '../../../strategic_projects/AbstractStrategicProject';
import { ALL_STRATEGIC_PROJECTS } from '../../../strategic_projects/StrategicProjectList';

export class CampaignUiState {
    private static instance: CampaignUiState;

    // --- XCOM-style strategic layer (see src/docs/strategic_layer_redesign.md) ---
    public calendar: CampaignCalendar = new CampaignCalendar();
    public availableContracts: Contract[] = [];
    public selectedContract: Contract | null = null;
    public ownedStrategicProjects: AbstractStrategicProject[] = [];
    public availableStrategicProjects: AbstractStrategicProject[] = ALL_STRATEGIC_PROJECTS;
    public selectedParty: PlayerCharacter[] = [];
    public roster: PlayerCharacter[] = CampaignRules.getInstance().generateLogicalCharacterRoster();

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
                .refillBoard(this.availableContracts, this.calendar.year);
        }
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

        // Wounded soldiers recuperate.
        this.roster.forEach(character => {
            if (character.weeksWoundedRemaining > 0) {
                character.weeksWoundedRemaining = Math.max(0, character.weeksWoundedRemaining - n);
            }
        });

        // Contracts age off the board; fresh ones post.
        this.availableContracts.forEach(c => c.deadlineWeeks -= n);
        this.availableContracts = this.availableContracts.filter(c => c.deadlineWeeks > 0);
        this.availableContracts = ContractGenerator.getInstance()
            .refillBoard(this.availableContracts, this.calendar.year);
    }
} 