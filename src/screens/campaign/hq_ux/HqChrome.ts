import Phaser, { Scene } from 'phaser';
import { CampaignUiState } from './CampaignUiState';
import { CHARTER_YEARS } from '../../../campaign/CampaignCalendar';
import { SaveManager } from '../../../saveload/SaveManager';
import { drawWoodPanel, Fonts, Palette } from '../../../ui/UIStyle';

/** Depth chrome sits above panels (panels show at 999). */
const CHROME_DEPTH = 1500;

const STATUS_BAR_HEIGHT = 56;
const STATUS_BAR_Y = 28;
const TAB_RAIL_HEIGHT = 44;
const TAB_RAIL_Y = STATUS_BAR_Y + STATUS_BAR_HEIGHT / 2 + TAB_RAIL_HEIGHT / 2;

const DISARM_MS = 3000;

export type HqTabKey = 'contracts' | 'barracks' | 'investment' | 'ledger' | 'quartermaster';

const TABS: { key: HqTabKey; label: string }[] = [
    { key: 'contracts', label: 'CONTRACTS' },
    { key: 'barracks', label: 'BARRACKS' },
    { key: 'quartermaster', label: 'PROVISIONS' },
    { key: 'investment', label: 'BOARDROOM' },
    { key: 'ledger', label: 'LEDGER' },
];

/**
 * Persistent status bar + tab rail, created once by HqScene and kept alive
 * above every normal panel. Replaces the old MainHubPanel hub-and-spoke:
 * navigation is now a flat set of tabs with always-visible status chrome.
 */
export class HqChrome extends Phaser.GameObjects.Container {
    private centerText!: Phaser.GameObjects.Text;
    private statusText!: Phaser.GameObjects.Text;
    private statusPlaque!: Phaser.GameObjects.Graphics;
    private tabButtons: Map<HqTabKey, { bg: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text; }> = new Map();
    private activeTab: HqTabKey = 'contracts';

    private wipeArmed = false;
    private wipeDisarmTimer?: Phaser.Time.TimerEvent;
    private wipeButtonBg!: Phaser.GameObjects.Graphics;
    private wipeButtonLabel!: Phaser.GameObjects.Text;

    constructor(scene: Scene) {
        super(scene, 0, 0);
        scene.add.existing(this);
        this.setDepth(CHROME_DEPTH);

        this.buildStatusBar();
        this.buildTabRail();
        this.buildHoldPostButton();
        this.buildNewCampaignButton();
    }

    // --- Status bar ---------------------------------------------------------

    private buildStatusBar(): void {
        const scene = this.scene;
        const width = scene.scale.width;

        const bar = scene.add.container(width / 2, STATUS_BAR_Y);
        bar.add(drawWoodPanel(scene, width, STATUS_BAR_HEIGHT, false));

        const title = scene.add.text(-width / 2 + 20, 0, 'The East Infernal Company', {
            fontFamily: Fonts.DISPLAY, fontSize: '22px', color: Palette.BRASS_TEXT,
        }).setOrigin(0, 0.5);
        bar.add(title);

        this.centerText = scene.add.text(0, 0, '', {
            fontFamily: Fonts.BODY, fontSize: '16px', color: Palette.WHITE,
        }).setOrigin(0.5);
        bar.add(this.centerText);

        this.statusPlaque = scene.add.graphics();
        bar.add(this.statusPlaque);

        this.statusText = scene.add.text(width / 2 - 20, 0, '', {
            fontFamily: Fonts.BODY, fontSize: '16px', color: Palette.WHITE, align: 'right',
        }).setOrigin(1, 0.5);
        bar.add(this.statusText);

        this.add(bar);
    }

    // --- Tab rail ------------------------------------------------------------

    private buildTabRail(): void {
        const scene = this.scene;
        const width = scene.scale.width;
        const rail = scene.add.container(0, TAB_RAIL_Y);
        rail.add(drawWoodPanel(scene, width, TAB_RAIL_HEIGHT, false).setPosition(width / 2, 0));

        const tabW = 180;
        const gap = 6;
        const totalW = TABS.length * tabW + (TABS.length - 1) * gap;
        let x = width / 2 - totalW / 2 + tabW / 2;

        TABS.forEach(tab => {
            const container = scene.add.container(x, 0);
            const bg = scene.add.graphics();
            const label = scene.add.text(0, 0, tab.label, {
                fontFamily: Fonts.DISPLAY, fontSize: '18px', color: Palette.BRASS_TEXT,
            }).setOrigin(0.5);
            container.add([bg, label]);
            container.setSize(tabW, TAB_RAIL_HEIGHT - 8);
            container.setInteractive();
            container.on('pointerover', () => { if (this.activeTab !== tab.key) container.setScale(1.02); });
            container.on('pointerout', () => container.setScale(1));
            container.on('pointerdown', () => this.scene.events.emit('navigate', tab.key));
            rail.add(container);

            this.tabButtons.set(tab.key, { bg, label });
            x += tabW + gap;
        });

        this.add(rail);
        this.redrawTabs();
    }

    private redrawTabs(): void {
        const tabW = 180;
        const h = TAB_RAIL_HEIGHT - 8;
        this.tabButtons.forEach((btn, key) => {
            const active = key === this.activeTab;
            btn.bg.clear();
            btn.bg.fillStyle(active ? Palette.VERDIGRIS : Palette.WOOD_PANEL, 0.96);
            btn.bg.fillRect(-tabW / 2, -h / 2, tabW, h);
            btn.bg.lineStyle(2, active ? Palette.BRASS_BRIGHT : Palette.BRASS, 0.9);
            btn.bg.strokeRect(-tabW / 2 + 2, -h / 2 + 2, tabW - 4, h - 4);
            btn.label.setColor(active ? Palette.WHITE : Palette.BRASS_TEXT);
        });
    }

    /** Called by HqScene whenever the active panel changes, to keep the
     *  tab highlight in sync (including on boot, before any click). */
    public setActiveTab(tab: HqTabKey): void {
        this.activeTab = tab;
        this.redrawTabs();
    }

    // --- HOLD POST -------------------------------------------------------

    private buildHoldPostButton(): void {
        const scene = this.scene;
        const width = scene.scale.width;
        const btnW = 190, btnH = TAB_RAIL_HEIGHT - 8;
        const container = scene.add.container(width - btnW / 2 - 16, TAB_RAIL_Y);

        const bg = scene.add.graphics();
        bg.fillStyle(Palette.WAX_RED, 1);
        bg.fillRect(-btnW / 2, -btnH / 2, btnW, btnH);
        bg.lineStyle(2, Palette.BRASS_BRIGHT, 1);
        bg.strokeRect(-btnW / 2 + 2, -btnH / 2 + 2, btnW - 4, btnH - 4);
        container.add(bg);

        const label = scene.add.text(0, 0, 'HOLD POST · +1 WEEK', {
            fontFamily: Fonts.DISPLAY, fontSize: '15px', color: Palette.WHITE,
        }).setOrigin(0.5);
        container.add(label);

        container.setSize(btnW, btnH);
        container.setInteractive();
        container.on('pointerover', () => container.setScale(1.03));
        container.on('pointerout', () => container.setScale(1));
        container.on('pointerdown', () => this.handleHoldPost());

        this.add(container);
    }

    private handleHoldPost(): void {
        CampaignUiState.getInstance().advanceWeeks(1);
        SaveManager.save();
        // Re-emit the current tab so the visible panel rebuilds against the
        // now-advanced calendar (contract deadlines, wounds, etc.).
        this.scene.events.emit('navigate', this.activeTab);
    }

    // --- NEW CAMPAIGN (two-step confirm) ---------------------------------

    private buildNewCampaignButton(): void {
        const scene = this.scene;
        const btnW = 150, btnH = 30;
        // Bottom-left corner, out of the way of panel content.
        const container = scene.add.container(btnW / 2 + 14, scene.scale.height - btnH / 2 - 10);

        this.wipeButtonBg = scene.add.graphics();
        container.add(this.wipeButtonBg);

        this.wipeButtonLabel = scene.add.text(0, 0, 'NEW CAMPAIGN', {
            fontFamily: Fonts.UTILITY, fontSize: '12px', color: Palette.DISABLED_TEXT,
        }).setOrigin(0.5);
        container.add(this.wipeButtonLabel);

        container.setSize(btnW, btnH);
        container.setInteractive();
        container.on('pointerover', () => container.setScale(1.03));
        container.on('pointerout', () => container.setScale(1));
        container.on('pointerdown', () => this.handleNewCampaignClick());

        this.redrawWipeButton();
        this.add(container);
    }

    private redrawWipeButton(): void {
        const btnW = 150, btnH = 30;
        this.wipeButtonBg.clear();
        this.wipeButtonBg.fillStyle(this.wipeArmed ? Palette.WAX_RED : Palette.WOOD_PANEL, 0.9);
        this.wipeButtonBg.fillRect(-btnW / 2, -btnH / 2, btnW, btnH);
        this.wipeButtonBg.lineStyle(1, this.wipeArmed ? Palette.BRASS_BRIGHT : Palette.DISABLED, 0.8);
        this.wipeButtonBg.strokeRect(-btnW / 2 + 1, -btnH / 2 + 1, btnW - 2, btnH - 2);
        this.wipeButtonLabel.setText(this.wipeArmed ? 'CONFIRM: WIPE SAVE?' : 'NEW CAMPAIGN');
        this.wipeButtonLabel.setColor(this.wipeArmed ? Palette.CRIMSON_TEXT : Palette.DISABLED_TEXT);
    }

    private handleNewCampaignClick(): void {
        if (!this.wipeArmed) {
            this.wipeArmed = true;
            this.redrawWipeButton();
            this.wipeDisarmTimer?.remove();
            this.wipeDisarmTimer = this.scene.time.delayedCall(DISARM_MS, () => {
                this.wipeArmed = false;
                this.redrawWipeButton();
            });
            return;
        }
        // Second click while armed: actually wipe.
        this.wipeDisarmTimer?.remove();
        SaveManager.deleteSave();
        window.location.reload();
    }

    // --- Per-frame refresh -------------------------------------------------

    public update(): void {
        const campaign = CampaignUiState.getInstance();
        const cal = campaign.calendar;
        const gameState = campaign.getCurrentFunds();

        this.centerText.setText(
            `Year ${cal.year}, Q${cal.quarterOfYear}, Week ${cal.weekOfQuarter} · ` +
            `${cal.year} of ${CHARTER_YEARS} years on the charter`
        );

        const dueSoon = cal.weeksUntilDividend <= 2 && gameState < cal.currentDividendExpectation;
        const distressed = cal.shareholderSatisfaction < 25 || dueSoon;

        this.statusText.setText(
            `Vault: £${gameState}\n` +
            `Dividend £${cal.currentDividendExpectation} in ${cal.weeksUntilDividend}w · Satisfaction ${cal.shareholderSatisfaction}/100`
        );
        this.statusText.setColor(distressed ? Palette.CRIMSON_TEXT : Palette.WHITE);
    }
}
