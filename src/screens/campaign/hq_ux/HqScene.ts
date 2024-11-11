import { Scene } from 'phaser';
import { GameState } from '../../../rules/GameState';
import { ActionManagerFetcher } from '../../../utils/ActionManagerFetcher';
import GameImageLoader from '../../../utils/ImageUtils';
import { SceneChanger } from '../../SceneChanger';
import { CampaignState } from './CampaignState';
import { InvestmentPanel } from './panels/InvestmentPanel';
import { LoadoutPanel } from './panels/LoadoutPanel';
import { MainHubPanel } from './panels/MainHubPanel';
import { PersonnelPanel } from './panels/PersonnelPanel';
import { TradeGoodsPanel } from './panels/TradeGoodsPanel';
import { TradePanel } from './panels/TradePanel';

export class HqScene extends Scene {
    private currentPanel?: Phaser.GameObjects.Container;
    private mainHubPanel!: MainHubPanel;
    private investmentPanel!: InvestmentPanel;
    private tradePanel!: TradePanel;
    private personnelPanel!: PersonnelPanel;
    private loadoutPanel!: LoadoutPanel;
    private tradeGoodsPanel!: TradeGoodsPanel;

    constructor() {
        super({ key: 'HqScene' });
    }

    preload(): void {
        ActionManagerFetcher.initActionManager();
        new GameImageLoader().loadAllImages(this.load);
        SceneChanger.setCurrentScene(this);
        // Load any required assets
    }

    create(): void {
        ActionManagerFetcher.initActionManager();

        // Initialize all panels
        this.mainHubPanel = new MainHubPanel(this);
        this.investmentPanel = new InvestmentPanel(this);
        this.tradePanel = new TradePanel(this);
        this.personnelPanel = new PersonnelPanel(this);
        this.loadoutPanel = new LoadoutPanel(this);
        this.tradeGoodsPanel = new TradeGoodsPanel(this);

        // Hide all panels initially
        [
            this.investmentPanel,
            this.tradePanel,
            this.personnelPanel,
            this.loadoutPanel,
            this.tradeGoodsPanel
        ].forEach(panel => panel.hide());

        // Show main hub initially
        this.showPanel('main');

        // Set up event listeners
        this.events.on('navigate', this.handleNavigation, this);
        this.events.on('returnToHub', () => this.showPanel('main'), this);
        this.events.on('launchExpedition', this.handleLaunchExpedition, this);

        // Set up scene-wide keyboard shortcuts
        this.input?.keyboard?.on('keydown-ESC', () => {
            if (this.currentPanel !== this.mainHubPanel) {
                this.showPanel('main');
            }
        });
    }

    private showPanel(panelKey: 'main' | 'investment' | 'trade' | 'personnel' | 'loadout' | 'tradegoods'): void {
        // Hide current panel
        if (this.currentPanel) {
            this.currentPanel.setVisible(false);
        }

        // Show requested panel
        switch (panelKey) {
            case 'main':
                this.currentPanel = this.mainHubPanel;
                break;
            case 'investment':
                this.currentPanel = this.investmentPanel;
                break;
            case 'trade':
                this.currentPanel = this.tradePanel;
                break;
            case 'personnel':
                this.currentPanel = this.personnelPanel;
                break;
            case 'loadout':
                this.currentPanel = this.loadoutPanel;
                break;
            case 'tradegoods':
                this.currentPanel = this.tradeGoodsPanel;
                break;
        }

        this.currentPanel?.setVisible(true);
    }

    private handleNavigation(destination: string): void {
        switch (destination) {
            case 'investment':
                this.showPanel('investment');
                break;
            case 'trade routes':
                this.showPanel('trade');
                break;
            case 'personnel':
                this.showPanel('personnel');
                break;
            case 'expedition loadout':
                this.showPanel('loadout');
                break;
            case 'trade goods':
                this.showPanel('tradegoods');
                break;
            default:
                console.warn(`Unknown destination: ${destination}`);
        }
    }

    private handleLaunchExpedition(): void {
        const gameState = GameState.getInstance();
        
        // Validate expedition requirements
        if (!this.validateExpeditionRequirements()) {
            return;
        }

        // Clean up physical cards
        gameState.eliminatePhysicalCardsBetweenScenes();

        // Transition to the map scene
        console.log('launching expedition (NOTE: TODO)');
        // SceneChanger.switchToCombatScene(campaignState.selectedTradeRoute);
    }

    private validateExpeditionRequirements(): boolean {
        const gameState = GameState.getInstance();
        const campaignState = CampaignState.getInstance();

        // Check for selected party members
        if (campaignState.selectedParty.length !== 3) {
            console.warn('Must select exactly 3 party members');
            return false;
        }

        // Check for selected trade route
        if (!campaignState.selectedTradeRoute) {
            console.warn('Must select a trade route');
            return false;
        }

        // Add any other validation as needed
        return true;
    }

    update(time: number, delta: number): void {
        // Update current panel
        if (this.currentPanel && 'update' in this.currentPanel) {
            (this.currentPanel as any).update(time, delta);
        }
    }

    shutdown(): void {
        // Clean up event listeners
        this.events.off('navigate');
        this.events.off('returnToHub');
        this.events.off('launchExpedition');
    }
}