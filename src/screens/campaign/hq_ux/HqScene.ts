import { Scene } from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { GameState } from '../../../rules/GameState';
import { TransientUiState } from '../../../ui/TransientUiState';
import { ActionManagerFetcher } from '../../../utils/ActionManagerFetcher';
import ImageUtils from '../../../utils/ImageUtils';
import { installLoaderWatchdog } from '../../../utils/LoaderWatchdog';
import { SceneChanger } from '../../SceneChanger';
import { CampaignUiState } from './CampaignUiState';
import { HqChrome, HqTabKey } from './HqChrome';
import { AbstractHqPanel } from './panels/AbstractHqPanel';
import { SortieManager } from '../../../campaign/SortieManager';
import { SaveManager } from '../../../saveload/SaveManager';
import { BarracksPanel } from './panels/BarracksPanel';
import { ContractBoardPanel } from './panels/ContractBoardPanel';
import { EndOfCampaignPanel } from './panels/EndOfCampaignPanel';
import { InvestmentPanel } from './panels/InvestmentPanel';
import { LedgerPanel } from './panels/LedgerPanel';
import { PromotionPanel } from './panels/PromotionPanel';
import { QuartermasterPanel } from './panels/QuartermasterPanel';
import { SortieReportPanel } from './panels/SortieReportPanel';
import { pendingLevels } from '../../../campaign/Leveling';
import { OnboardingLetter } from './OnboardingLetter';

type PanelKey = 'contracts' | 'investment' | 'barracks' | 'ledger' | 'ending' | 'report' | 'promotion' | 'quartermaster';

export class HqScene extends Scene {
    private currentPanel?: AbstractHqPanel;
    private currentPanelKey?: PanelKey;
    private chrome!: HqChrome;
    private investmentPanel!: InvestmentPanel;
    private contractBoardPanel!: ContractBoardPanel;
    private barracksPanel!: BarracksPanel;
    private ledgerPanel!: LedgerPanel;
    private endOfCampaignPanel!: EndOfCampaignPanel;
    private sortieReportPanel!: SortieReportPanel;
    private promotionPanel!: PromotionPanel;
    private quartermasterPanel!: QuartermasterPanel;

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
        this.investmentPanel = new InvestmentPanel(this);
        this.contractBoardPanel = new ContractBoardPanel(this);
        this.barracksPanel = new BarracksPanel(this);
        this.ledgerPanel = new LedgerPanel(this);
        this.endOfCampaignPanel = new EndOfCampaignPanel(this);
        this.sortieReportPanel = new SortieReportPanel(this);
        this.promotionPanel = new PromotionPanel(this);
        this.quartermasterPanel = new QuartermasterPanel(this);

        // Hide all panels initially
        this.investmentPanel.setVisible(false);
        this.contractBoardPanel.setVisible(false);
        this.barracksPanel.setVisible(false);
        this.ledgerPanel.setVisible(false);
        this.endOfCampaignPanel.setVisible(false);
        this.sortieReportPanel.setVisible(false);
        this.promotionPanel.setVisible(false);
        this.quartermasterPanel.setVisible(false);

        // The chrome (status bar + tab rail) persists above every normal
        // panel; it is created once and never destroyed across sortie
        // returns... except create() DOES re-run on every sortie return, so
        // an old chrome instance (with stale timers/listeners) must go first.
        this.chrome?.destroy();
        this.chrome = new HqChrome(this);

        // Endings trump everything; a fresh debrief trumps the board; a
        // still-pending promotion queue (player quit mid-queue and reloaded —
        // pendingLevels is derived from xp, so it survives) trumps the board too.
        if (this.isCampaignOver()) {
            this.showPanel('ending');
        } else if (SortieManager.getInstance().hasUnviewedReport) {
            this.showPanel('report');
        } else if (CampaignUiState.getInstance().roster.some(c => pendingLevels(c) > 0)) {
            this.showPanel('promotion');
        } else {
            this.showPanel('contracts');
        }

        // Set up event listeners. create() re-runs on every sortie return, so
        // clear any prior registrations first to avoid stale-closure leaks.
        this.events.off('navigate');

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
                case 'ledger':
                    this.showPanel('ledger');
                    break;
                case 'promotion':
                    this.showPanel('promotion');
                    break;
                case 'quartermaster':
                    this.showPanel('quartermaster');
                    break;
                default:
                    this.showPanel('contracts');
            }
        });

        // Set up scene-wide keyboard shortcuts. The node-map-era hub is gone;
        // ESC now returns to the contract board (the new home screen).
        this.input?.keyboard?.off('keydown-ESC');
        this.input?.keyboard?.on('keydown-ESC', () => {
            if (this.currentPanelKey !== 'contracts' && !this.isCampaignOver()) {
                this.showPanel('contracts');
            }
        });

        // Arriving at HQ (fresh boot or sortie return) is the save checkpoint.
        SaveManager.save();

        // Cavendish's first dispatch: shown once, layered above whichever
        // panel just got selected, only on the app session that booted with
        // no save on disk. bootedFresh is a transient session flag (never
        // serialized) so this never reappears after a reload finds a save.
        if (SaveManager.bootedFresh) {
            SaveManager.bootedFresh = false;
            new OnboardingLetter(this, () => { /* no-op: overlay self-destroys */ });
        }
    }

    private isCampaignOver(): boolean {
        const cal = CampaignUiState.getInstance().calendar;
        return cal.isSacked || cal.isCharterExpired;
    }

    private showPanel(panelKey: PanelKey): void {
        if (this.currentPanel) {
            this.currentPanel.setVisible(false);
            this.currentPanel.hide();
            this.currentPanel.setDepth(0);
        }

        switch (panelKey) {
            case 'investment':
                this.currentPanel = this.investmentPanel;
                break;
            case 'contracts':
                this.currentPanel = this.contractBoardPanel;
                break;
            case 'barracks':
                this.currentPanel = this.barracksPanel;
                break;
            case 'ledger':
                this.currentPanel = this.ledgerPanel;
                break;
            case 'ending':
                this.currentPanel = this.endOfCampaignPanel;
                break;
            case 'report':
                this.currentPanel = this.sortieReportPanel;
                break;
            case 'promotion':
                this.currentPanel = this.promotionPanel;
                break;
            case 'quartermaster':
                this.currentPanel = this.quartermasterPanel;
                break;
        }
        this.currentPanelKey = panelKey;

        this.currentPanel?.setVisible(true);
        this.currentPanel?.show();
        this.currentPanel?.setDepth(999);

        // The ending screen is terminal and gets the whole frame to itself;
        // every other panel (including the sortie debrief) keeps the
        // persistent chrome visible above it.
        this.chrome.setVisible(panelKey !== 'ending');
        if (panelKey === 'contracts' || panelKey === 'investment'
            || panelKey === 'barracks' || panelKey === 'ledger' || panelKey === 'quartermaster') {
            this.chrome.setActiveTab(panelKey as HqTabKey);
        }
    }

    update(time: number, delta: number): void {
        this.chrome?.update();

        // Update current panel
        if (this.currentPanel && 'update' in this.currentPanel) {
            (this.currentPanel as any).update(time, delta);
        }
    }
}