import Phaser, { Scene } from 'phaser';
import { pendingLevels } from '../../../../campaign/Leveling';
import { SortieManager } from '../../../../campaign/SortieManager';
import { ConsumablesLibrary } from '../../../../consumables/ConsumablesLibrary';
import { GameState } from '../../../../rules/GameState';
import { TextBoxButton } from '../../../../ui/Button';
import { drawBackdropDim, drawPaper, Fonts, Palette } from '../../../../ui/UIStyle';
import SoundUtils from '../../../../utils/SoundUtils';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

const REPORT_W = 900;
const REPORT_H = 560;

/**
 * Post-sortie debrief: shown once on returning to the HQ, before the hub.
 * Presented as a typed field report on Company letterhead — the emotional
 * beat of the loop (payouts, wounds, the dead) gets a moment on the page
 * instead of a sidebar footnote.
 */
export class SortieReportPanel extends AbstractHqPanel {
    private reportText: Phaser.GameObjects.Text;

    constructor(scene: Scene) {
        super(scene, 'Expedition Debrief');
        this.titleText.setVisible(false); // replaced by the letterhead below

        const dim = drawBackdropDim(scene, 0.55);
        this.add(dim);

        const sheet = scene.add.container(scene.scale.width / 2, scene.scale.height / 2 + 10);
        sheet.add(drawPaper(scene, REPORT_W, REPORT_H, false));

        sheet.add(scene.add.text(-REPORT_W / 2 + 30, -REPORT_H / 2 + 24,
            'FIELD REPORT — EXPEDITIONARY DEBRIEF', {
            fontFamily: Fonts.DISPLAY, fontSize: '20px', color: Palette.INK,
        }));
        sheet.add(scene.add.text(REPORT_W / 2 - 30, -REPORT_H / 2 + 26, 'FOR COMPANY RECORDS ONLY', {
            fontFamily: Fonts.UTILITY, fontSize: '11px', color: Palette.INK_FADED, letterSpacing: 1,
        }).setOrigin(1, 0));

        const rule = scene.add.graphics();
        rule.lineStyle(1, Palette.PAPER_SHADOW, 0.5);
        rule.lineBetween(-REPORT_W / 2 + 30, -REPORT_H / 2 + 56, REPORT_W / 2 - 30, -REPORT_H / 2 + 56);
        sheet.add(rule);

        // Plain rexBBCodeText (not the TextBox wrapper) so the paper shows
        // through and the box doesn't reflow/reposition to fit its content
        // — see OnboardingLetter for the same pattern.
        this.reportText = (scene.add as any).rexBBCodeText(-REPORT_W / 2 + 30, -REPORT_H / 2 + 78, '', {
            fontFamily: Fonts.BODY, fontSize: '18px', color: Palette.INK,
            wrap: { mode: 'word', width: REPORT_W - 60 },
        });
        sheet.add(this.reportText);

        const continueButton = new TextBoxButton({
            scene,
            x: 0,
            y: REPORT_H / 2 - 44,
            width: 260,
            height: 52,
            text: 'File the Report',
            style: { fontSize: '19px', fontFamily: Fonts.DISPLAY, color: Palette.WHITE },
            fillColor: Palette.VERDIGRIS
        });
        continueButton.onClick(() => {
            SortieManager.getInstance().hasUnviewedReport = false;
            const hasPendingPromotion = CampaignUiState.getInstance().roster.some(c => pendingLevels(c) > 0);
            this.scene.events.emit('navigate', hasPendingPromotion ? 'promotion' : 'contracts');
        });
        sheet.add(continueButton);

        this.add(sheet);
    }

    public show(): void {
        this.grantPendingConsumableReward();
        const report = SortieManager.getInstance().lastSortieReport;
        this.reportText.setText(report.length > 0 ? report.join('\n\n') : 'Nothing to report.');
        // A quarter's board meeting settled sometime during this sortie (see
        // CampaignCalendar.settleDividend's "dividend" log lines, folded
        // into lastSortieReport by SortieManager). This debrief is the first
        // UI the player sees back at HQ, so it's the seam for the one
        // quarterly sting — pure campaign code can't play sound itself.
        if (report.some(line => line.includes('dividend'))) {
            SoundUtils.play(this.scene, 'board_meeting_sting', 0.5);
        }
        super.show();
    }

    /**
     * D7 seam: SortieManager.resolveSortie (src/campaign/, Phaser-free per
     * house rule 1) cannot import ConsumablesLibrary, so it only records the
     * reward's name on pendingConsumableRewardName. This panel is the first
     * Phaser-bound code to run after resolution, so it performs the actual
     * grant here: push to campaign stock if under cap, otherwise bank half
     * the consumable's price as resale (a spare consumable earns something
     * rather than evaporating silently at a full stockroom).
     */
    private grantPendingConsumableReward(): void {
        const sortieManager = SortieManager.getInstance();
        const name = sortieManager.pendingConsumableRewardName;
        sortieManager.pendingConsumableRewardName = null;
        if (!name) return;

        const consumable = ConsumablesLibrary.getInstance().getConsumableByName(name);
        if (!consumable) {
            console.warn(`SortieReportPanel: unknown consumable reward "${name}", skipping grant`);
            return;
        }
        consumable.init();

        const campaign = CampaignUiState.getInstance();
        if (!campaign.isConsumableStockFull()) {
            campaign.consumables.push(consumable);
        } else {
            const resale = Math.floor(consumable.basePrice / 2);
            GameState.getInstance().moneyInVault += resale;
            sortieManager.lastSortieReport.push(
                `Provisioning stores full: ${name} sold back to the Company for £${resale}.`
            );
        }
    }

    update(): void {
        // Static; dismissed by the button.
    }
}
