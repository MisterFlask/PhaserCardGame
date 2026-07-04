import { CampaignCalendar } from '../../../campaign/CampaignCalendar';
import { Contract } from '../../../campaign/Contract';
import { ContractGenerator } from '../../../campaign/ContractGenerator';
import { PlayableCard } from '../../../gamecharacters/PlayableCard';
import { PlayerCharacter } from '../../../gamecharacters/PlayerCharacter';
import { CoalCargo } from '../../../gamecharacters/cargo/CoalCargo';
import { CoffeeCargo } from '../../../gamecharacters/cargo/CoffeeCargo';
import { CopperIngot } from '../../../gamecharacters/cargo/CopperIngot';
import { SpicyLiteratureCargo } from '../../../gamecharacters/cargo/SpicyLiteratureCargo';
import { CampaignRules } from '../../../rules/CampaignRulesHelper';
import { GameState } from '../../../rules/GameState';
import { AbstractStrategicProject } from '../../../strategic_projects/AbstractStrategicProject';
import { ALL_STRATEGIC_PROJECTS } from '../../../strategic_projects/StrategicProjectList';
import { AbstractTradeRoute, StandardTradeRoute } from './AbstractTradeRoute';

export class CampaignUiState {
    private static instance: CampaignUiState;

    public currentYear: number = 1;
    public shareholderExpectation: number = 1000;

    // --- XCOM-style strategic layer (see src/docs/strategic_layer_redesign.md) ---
    public calendar: CampaignCalendar = new CampaignCalendar();
    public availableContracts: Contract[] = [];
    public selectedContract: Contract | null = null;
    public availableTradeRoutes: AbstractTradeRoute[] = [new StandardTradeRoute(),new StandardTradeRoute(),new StandardTradeRoute()];
    public ownedStrategicProjects: AbstractStrategicProject[] = [];
    public availableStrategicProjects: AbstractStrategicProject[] = ALL_STRATEGIC_PROJECTS;
    public selectedTradeRoute: AbstractTradeRoute | null = null;
    public selectedParty: PlayerCharacter[] = [];
    public roster: PlayerCharacter[] = CampaignRules.getInstance().generateLogicalCharacterRoster();
    public availableTradeGoods: PlayableCard[] = [new CoffeeCargo(), new CoalCargo(), new SpicyLiteratureCargo()];
    
    private constructor() {}

    public static getInstance(): CampaignUiState {
        if (!CampaignUiState.instance) {
            CampaignUiState.instance = new CampaignUiState();
        }
        return CampaignUiState.instance;
    }

    public reinitializeCampaignUiStateAfterRun(): void {
        this.availableTradeRoutes = [new StandardTradeRoute(),new StandardTradeRoute(),new StandardTradeRoute()];
        this.selectedTradeRoute = null;
        this.selectedParty = [];

        // Initialize available trade goods with baseline copper ingots
        this.availableTradeGoods = [];
        for (let i = 0; i < 2; i++) {
            this.availableTradeGoods.push(new CopperIngot());
        }

        // Add cargo options from owned strategic projects
        this.ownedStrategicProjects.forEach((project: AbstractStrategicProject) => {
            const additionalCargo = project.getAdditionalCargoOptions();
            this.availableTradeGoods.push(...additionalCargo);
        });

        // Apply cargo modifiers from strategic projects
        this.ownedStrategicProjects.forEach((project: AbstractStrategicProject) => {
            project.postProcessCampaignStateAfterRun();
        });
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

        this.currentYear = this.calendar.year;
    }
} 