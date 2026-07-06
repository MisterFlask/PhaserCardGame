import Phaser, { Scene } from 'phaser';
import { SortieManager } from '../../../../campaign/SortieManager';
import { drawPaper, Fonts, Palette } from '../../../../ui/UIStyle';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

const MAX_MINUTES = 25;

/**
 * The board minutes: a running log of dividends, satisfaction swings, and
 * fiscal-year escalations, newest first, plus the latest sortie's dispatch
 * digest. Replaces the empty black reportDisplay box that used to live on
 * MainHubPanel.
 */
export class LedgerPanel extends AbstractHqPanel {
    private dynamic: Phaser.GameObjects.GameObject[] = [];

    constructor(scene: Scene) {
        super(scene, 'The Ledger');
        this.titleText.setVisible(false); // tab rail names the view
    }

    public show(): void {
        this.rebuild();
        super.show();
    }

    private clearDynamic(): void {
        this.dynamic.forEach(o => { this.remove(o); o.destroy(); });
        this.dynamic = [];
    }

    private addDynamic<T extends Phaser.GameObjects.GameObject>(obj: T): T {
        this.dynamic.push(obj);
        this.add(obj);
        return obj;
    }

    private rebuild(): void {
        this.clearDynamic();
        const scene = this.scene;
        const width = scene.scale.width;
        const height = scene.scale.height;

        const paperTop = 130;
        const paperHeight = height - paperTop - 40;
        const paperCenterY = paperTop + paperHeight / 2;

        const paper = this.addDynamic(scene.add.container(width / 2, paperCenterY));
        paper.add(drawPaper(scene, width - 160, paperHeight, true));

        let cursorY = -paperHeight / 2 + 34;
        const lineHeight = 22;
        const contentX = -(width - 160) / 2 + 28;

        const sortieReport = SortieManager.getInstance().lastSortieReport;
        if (sortieReport.length > 0) {
            paper.add(scene.add.text(contentX, cursorY, '— Latest dispatches —', {
                fontFamily: Fonts.DISPLAY, fontSize: '18px', color: Palette.INK,
            }));
            cursorY += lineHeight + 6;

            sortieReport.forEach(line => {
                const t = scene.add.text(contentX, cursorY, line, {
                    fontFamily: Fonts.BODY, fontSize: '14px', color: Palette.INK_FADED,
                    wordWrap: { width: width - 220 },
                });
                paper.add(t);
                cursorY += t.height + 4;
            });
            cursorY += 16;
        }

        paper.add(scene.add.text(contentX, cursorY, 'BOARD MINUTES', {
            fontFamily: Fonts.DISPLAY, fontSize: '20px', color: Palette.INK,
        }));
        cursorY += lineHeight + 8;

        const campaign = CampaignUiState.getInstance();
        const events = campaign.calendar.boardEvents;
        const newestFirst = [...events].reverse();
        const truncated = newestFirst.length > MAX_MINUTES;
        const visible = newestFirst.slice(0, MAX_MINUTES);

        visible.forEach(evt => {
            const text = scene.add.text(contentX, cursorY, `Wk ${evt.week} · ${evt.message}`, {
                fontFamily: Fonts.BODY, fontSize: '14px',
                color: evt.isWarning ? Palette.CRIMSON_TEXT : Palette.INK,
                wordWrap: { width: width - 220 },
            });
            paper.add(text);
            cursorY += text.height + 6;
        });

        if (truncated) {
            paper.add(scene.add.text(contentX, cursorY, '…earlier minutes filed away', {
                fontFamily: Fonts.BODY, fontSize: '13px', fontStyle: 'italic', color: Palette.INK_FADED,
            }));
        }

        if (events.length === 0 && sortieReport.length === 0) {
            paper.add(scene.add.text(contentX, cursorY, 'No business yet before the board.', {
                fontFamily: Fonts.BODY, fontSize: '14px', fontStyle: 'italic', color: Palette.INK_FADED,
            }));
        }
    }

    update(): void {
        // Static between visits; rebuilt on show().
    }
}
