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
        return this.getCurrentFunds() / this.shareholderExpectation;
    }
} 