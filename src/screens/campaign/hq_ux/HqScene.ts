import { Scene } from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { GameState } from '../../../rules/GameState';
import { TransientUiState } from '../../../ui/TransientUiState';
import { ActionManagerFetcher } from '../../../utils/ActionManagerFetcher';
import ImageUtils from '../../../utils/ImageUtils';
import { installLoaderWatchdog } from '../../../utils/LoaderWatchdog';
import { SceneChanger } from '../../SceneChanger';
import { CampaignUiState } from './CampaignUiState';
import { AbstractHqPanel } from './panels/AbstractHqPanel';
import { SaveManager } from '../../../saveload/SaveManager';
import { BarracksPanel } from './panels/BarracksPanel';
import { ContractBoardPanel } from './panels/ContractBoardPanel';
import { EndOfCampaignPanel } from './panels/EndOfCampaignPanel';
import { InvestmentPanel } from './panels/InvestmentPanel';
import { MainHubPanel } from './panels/MainHubPanel';

export class HqScene extends Scene {
    private currentPanel?: AbstractHqPanel;
    private mainHubPanel!: MainHubPanel;
    private investmentPanel!: InvestmentPanel;
    private contractBoardPanel!: ContractBoardPanel;
    private barracksPanel!: BarracksPanel;
    private endOfCampaignPanel!: EndOfCampaignPanel;

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

        // Keep the loader alive if the tab is hidden during boot.
        installLoaderWatchdog(this);

        // Add all images to the load queue (served from local resources/)
        new ImageUtils().loadAllImages(this.load);
        
        SceneChanger.setCurrentScene(this);
        this.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true);
        // Load any required assets
        this.load.scenePlugin({
            key: 'rexUI',
            url: RexUIPlugin,
            sceneKey: 'rexUI',
            systemKey: 'rexUI',   // visible via plugins.get(...)
        });
    }

    create(): void {
        // Restore a saved campaign on first boot (no-op on sortie returns),
        // then autosave: arriving at HQ is the checkpoint.
        SaveManager.loadOnceOnBoot();

        // Create all panels
        this.mainHubPanel = new MainHubPanel(this);
        this.investmentPanel = new InvestmentPanel(this);
        this.contractBoardPanel = new ContractBoardPanel(this);
        this.barracksPanel = new BarracksPanel(this);
        this.endOfCampaignPanel = new EndOfCampaignPanel(this);

        // Hide all panels initially
        this.mainHubPanel.setVisible(false);
        this.investmentPanel.setVisible(false);
        this.contractBoardPanel.setVisible(false);
        this.barracksPanel.setVisible(false);
        this.endOfCampaignPanel.setVisible(false);

        // Show main hub panel by default — unless the campaign is over.
        if (this.isCampaignOver()) {
            this.showPanel('ending');
        } else {
            this.showPanel('main');
        }

        // Set up event listeners
        this.events.on('navigate', (destination: string) => {
            if (this.isCampaignOver()) {
                this.showPanel('ending');
                return;
            }
            switch (destination) {
                case 'investment':
                    this.showPanel('investment');
                    break;
                case 'contracts':
                    this.showPanel('contracts');
                    break;
                case 'barracks':
                    this.showPanel('barracks');
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
            if (this.currentPanel !== this.mainHubPanel && !this.isCampaignOver()) {
                this.showPanel('main');
            }
        });

        // Arriving at HQ (fresh boot or sortie return) is the save checkpoint.
        SaveManager.save();
    }

    private isCampaignOver(): boolean {
        const cal = CampaignUiState.getInstance().calendar;
        return cal.isSacked || cal.isCharterExpired;
    }

    private showPanel(
        panelKey: 'main' | 'investment' | 'contracts' | 'barracks' | 'ending'
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
            case 'contracts':
                this.currentPanel = this.contractBoardPanel;
                break;
            case 'barracks':
                this.currentPanel = this.barracksPanel;
                break;
            case 'ending':
                this.currentPanel = this.endOfCampaignPanel;
                break;
        }

        this.currentPanel?.setVisible(true);
        this.currentPanel?.show();
        this.currentPanel?.setDepth(999);
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