import Phaser, { Scene } from 'phaser';
import { TextBoxButton } from '../../../ui/Button';
import { drawBackdropDim, drawPaper, Fonts, Palette } from '../../../ui/UIStyle';
import { DepthManager } from '../../../ui/DepthManager';

const LETTER_W = 620;
const LETTER_H = 560;

/**
 * Cavendish's first dispatch to the incoming manager: shown once, as an
 * overlay above the HQ chrome, on a brand-new campaign boot only (gated by
 * SaveManager.bootedFresh — see HqScene.create). Dismissing it just destroys
 * the overlay; there is no state to persist beyond "the player has seen it,"
 * which resets every session by design (SaveManager.bootedFresh is never
 * serialized).
 */
export class OnboardingLetter extends Phaser.GameObjects.Container {
    constructor(scene: Scene, onDismiss: () => void) {
        super(scene, 0, 0);
        scene.add.existing(this);
        this.setDepth(DepthManager.getInstance().MODAL);

        const dim = drawBackdropDim(scene, 0.6);
        this.add(dim);

        const cx = scene.scale.width / 2;
        const cy = scene.scale.height / 2;

        const letter = scene.add.container(cx, cy);
        letter.add(drawPaper(scene, LETTER_W, LETTER_H, false));

        letter.add(scene.add.text(0, -LETTER_H / 2 + 34, 'FROM THE DESK OF H. CAVENDISH, FIELD FACTOR', {
            fontFamily: Fonts.DISPLAY, fontSize: '18px', color: Palette.INK,
        }).setOrigin(0.5));

        // Plain rexBBCodeText (not the TextBox wrapper) so the paper shows
        // through — TextBox always paints an opaque background rectangle.
        const body = (scene.add as any).rexBBCodeText(0, -LETTER_H / 2 + 60, OnboardingLetter.LETTER_TEXT, {
            fontFamily: Fonts.BODY, fontSize: '16px', color: Palette.INK,
            wrap: { mode: 'word', width: LETTER_W - 80 },
        }).setOrigin(0.5, 0);
        letter.add(body);

        const button = new TextBoxButton({
            scene,
            x: 0, y: LETTER_H / 2 - 46,
            width: 260, height: 48,
            text: 'TAKE UP THE POST',
            style: { fontSize: '18px', fontFamily: Fonts.DISPLAY, color: Palette.WHITE },
            fillColor: Palette.VERDIGRIS,
        });
        button.onClick(() => {
            this.destroy();
            onDismiss();
        });
        letter.add(button);

        this.add(letter);
    }

    private static readonly LETTER_TEXT =
        "Dear Incoming Manager,\n\n" +
        "You will not recall hiring me, as you have not yet done so, but the paperwork is retroactive and binding regardless. Harry Cavendish, field factor, at your service — I certify sorties, claim credit for their successes, and am, by strange coincidence, never present for their failures.\n\n" +
        "The Company holds the Crown charter for trans-dimensional commerce as far down as the Third Circle. In exchange, the shareholders require a dividend of [color=yellow]£120 every thirteen weeks[/color], a figure they revise upward with a cheerfulness I find sinister. Fall short and you will be [i]replaced[/i] — administrative, I'm assured, rather than infernal, though the distinction has never once been demonstrated to my satisfaction.\n\n" +
        "Your roster waits downstairs: brave, expendable, and drawing wages regardless of results. Best get on with it.\n\n" +
        "Yours in mutual liability,\n— H. Cavendish, Field Factor";
}
