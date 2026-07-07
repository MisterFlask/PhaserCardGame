import Phaser, { Scene } from 'phaser';
import { DepthManager } from '../../ui/DepthManager';
import { TextBoxButton } from '../../ui/Button';
import { drawBackdropDim, drawPaper, Fonts, Palette } from '../../ui/UIStyle';

const NOTICE_W = 620;
const NOTICE_H = 420;

/**
 * Squad-wipe ceremony: a beat of formal acknowledgment before the game
 * drops the player back at HQ with the failure debrief. Mirrors
 * OnboardingLetter's pattern (dim + paper + BBCode + a single dismiss
 * button) — a scene-level overlay, not an AbstractHqPanel, since it's
 * shown from CombatAndMapScene before the scene switch to HqScene.
 *
 * The squad-wipe bookkeeping (roster losses, indemnity, the scene switch
 * itself) lives in SortieManager.handleSquadWipe and is deliberately NOT
 * run until the button is clicked — onProceed should invoke it.
 */
export class DefeatOverlay extends Phaser.GameObjects.Container {
    constructor(scene: Scene, onProceed: () => void) {
        super(scene, 0, 0);
        scene.add.existing(this);
        this.setDepth(DepthManager.getInstance().MODAL);

        const dim = drawBackdropDim(scene, 0.65);
        this.add(dim);

        const cx = scene.scale.width / 2;
        const cy = scene.scale.height / 2;

        const notice = scene.add.container(cx, cy);
        notice.add(drawPaper(scene, NOTICE_W, NOTICE_H, true));

        notice.add(scene.add.text(0, -NOTICE_H / 2 + 40, 'SERVICES RENDERED IN FULL', {
            fontFamily: Fonts.DISPLAY, fontSize: '22px', color: Palette.INK,
        }).setOrigin(0.5));

        const rule = scene.add.graphics();
        rule.lineStyle(1, Palette.PAPER_SHADOW, 0.5);
        rule.lineBetween(-NOTICE_W / 2 + 40, -NOTICE_H / 2 + 68, NOTICE_W / 2 - 40, -NOTICE_H / 2 + 68);
        notice.add(rule);

        const body = (scene.add as any).rexBBCodeText(0, -NOTICE_H / 2 + 90, DefeatOverlay.NOTICE_TEXT, {
            fontFamily: Fonts.BODY, fontSize: '17px', color: Palette.INK,
            align: 'center',
            wrap: { mode: 'word', width: NOTICE_W - 80 },
        }).setOrigin(0.5, 0);
        notice.add(body);

        const button = new TextBoxButton({
            scene,
            x: 0, y: NOTICE_H / 2 - 46,
            width: 280, height: 50,
            text: 'RETURN TO THE OFFICE',
            style: { fontSize: '18px', fontFamily: Fonts.DISPLAY, color: Palette.WHITE },
            fillColor: Palette.WAX_RED,
        });
        button.onClick(() => {
            this.destroy();
            onProceed();
        });
        notice.add(button);

        this.add(notice);
    }

    private static readonly NOTICE_TEXT =
        "The Company regrets to confirm that no member of the fielded party has survived to render further service.\n\n" +
        "The contract reverts to the board's [color=#c03a2b]losses column[/color]; the roster is amended accordingly.\n\n" +
        "Next of kin, where recorded, will be informed by post.";
}
