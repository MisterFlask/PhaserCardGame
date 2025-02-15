import { Scene } from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { GameState } from '../../../rules/GameState';
import { TransientUiState } from '../../../ui/TransientUiState';
import { ActionManagerFetcher } from '../../../utils/ActionManagerFetcher';
import GameImageLoader from '../../../utils/ImageUtils';
import { SceneChanger } from '../../SceneChanger';
import { CampaignUiState } from './CampaignUiState';
import { AbstractHqPanel } from './panels/AbstractHqPanel';
import { CargoSelectionPanel } from './panels/CargoSelectionPanel';
import { InvestmentPanel } from './panels/InvestmentPanel';
import { LiquidationPanel } from './panels/LiquidationPanel';
import { LoadoutPanel } from './panels/LoadoutPanel';
import { MainHubPanel } from './panels/MainHubPanel';
import { PersonnelPanel } from './panels/PersonnelPanel';
import { TradeRouteSelectionPanel } from './panels/TradeRouteSelectionPanel';

export class HqScene extends Scene {
    private currentPanel?: AbstractHqPanel;
    private mainHubPanel!: MainHubPanel;
    private investmentPanel!: InvestmentPanel;
    private tradePanel!: TradeRouteSelectionPanel;
    private personnelPanel!: PersonnelPanel;
    private loadoutPanel!: LoadoutPanel;
    private liquidationPanel!: LiquidationPanel;
    private cargoSelectionPanel!: CargoSelectionPanel;

    constructor() {
        super({ key: 'HqScene' });
    }

    preload(): void {
        // background and border of the loading bar
        const barWidth = 300;
        const barHeight = 30;
        const barX = (this.cameras.main.width - barWidth) / 2;
        const barY = (this.cameras.main.height - barHeight) / 2;

        // border and fill graphics
        const loadBar = this.add.graphics();
        const loadFill = this.add.graphics();

        loadBar.fillStyle(0x222222, 1); // dark background for the bar
        loadBar.fillRect(barX, barY, barWidth, barHeight);

        // update the bar as assets load
        this.load.on('progress', (progress: number) => {
            loadFill.clear();
            loadFill.fillStyle(0xffffff, 1); // white fill for progress
            loadFill.fillRect(barX, barY, barWidth * progress, barHeight);
        });

        this.load.on('complete', () => {
            loadFill.destroy();
            loadBar.destroy();
        });

        ActionManagerFetcher.initServicesAsync(this);
        new GameImageLoader().loadAllImages(this.load);
        SceneChanger.setCurrentScene(this);
        this.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true);
        // Load any required assets
        this.load.scenePlugin({
            key: 'rexUI',
            url: RexUIPlugin,
            sceneKey: 'rexUI'
        });
    }

    create(): void {
        // Create all panels
        this.mainHubPanel = new MainHubPanel(this);
        this.investmentPanel = new InvestmentPanel(this);
        this.tradePanel = new TradeRouteSelectionPanel(this);
        this.personnelPanel = new PersonnelPanel(this);
        this.loadoutPanel = new LoadoutPanel(this);
        this.liquidationPanel = new LiquidationPanel(this);
        this.cargoSelectionPanel = new CargoSelectionPanel(this);

        // Hide all panels initially
        this.mainHubPanel.setVisible(false);
        this.investmentPanel.setVisible(false);
        this.tradePanel.setVisible(false);
        this.personnelPanel.setVisible(false);
        this.loadoutPanel.setVisible(false);
        this.liquidationPanel.setVisible(false);
        this.cargoSelectionPanel.setVisible(false);

        // Show main hub panel by default
        this.showPanel('main');

        // Set up event listeners
        this.events.on('navigate', (destination: string) => {
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
                case 'loadout':
                    this.showPanel('loadout');
                    break;
                case 'trade goods':
                    this.showPanel('tradegoods');
                    break;
                case 'liquidation':
                    this.showPanel('liquidation');
                    break;
                case 'cargoselection':
                    this.showPanel('cargoselection');
                    break;
                default:
                    this.showPanel('main');
            }
        });

        this.events.on('returnToHub', () => {
            this.showPanel('main');
        });

        // Set up scene-wide keyboard shortcuts
        this.input?.keyboard?.on('keydown-ESC', () => {
            if (this.currentPanel !== this.mainHubPanel) {
                this.showPanel('main');
            }
        });
    }

    private showPanel(
        panelKey: 'main' | 'investment' | 'trade' | 'personnel' | 'loadout' | 'tradegoods' | 'liquidation' | 'cargoselection'
    ): void {
        if (this.currentPanel) {
            this.currentPanel.setVisible(false);
            this.currentPanel.hide();
            this.currentPanel.setDepth(0);
        }

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
            case 'liquidation':
                this.currentPanel = this.liquidationPanel;
                break;
            case 'cargoselection':
                this.currentPanel = this.cargoSelectionPanel;
                break;
        }
        
        this.currentPanel?.setVisible(true);
        this.currentPanel?.show();
        this.currentPanel?.setDepth(999);
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
        const campaignState = CampaignUiState.getInstance();

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

        if (TransientUiState.getInstance().showLiquidationPanel) {
            this.showPanel('liquidation');
            TransientUiState.getInstance().showLiquidationPanel = false;
        }
    }

    shutdown(): void {
        // Clean up event listeners
        this.events.off('navigate');
        this.events.off('returnToHub');
        this.events.off('launchExpedition');
    }
}