import { Scene } from 'phaser';
import { CHARTER_YEARS } from '../../../../campaign/CampaignCalendar';
import { GameState } from '../../../../rules/GameState';
import { SaveManager } from '../../../../saveload/SaveManager';
import { TextBoxButton } from '../../../../ui/Button';
import { TextBox } from '../../../../ui/TextBox';
import { drawBackdropDim, drawPaper, Fonts, Palette } from '../../../../ui/UIStyle';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

const MINUTES_W = 860;
const MINUTES_H = 620;

/**
 * Terminal screen for both campaign endings: sacked by the board
 * (satisfaction 0) or charter expiry (score screen). Presented as the
 * formal minutes of the board's final meeting on your case. No way back
 * except starting a new campaign.
 */
export class EndOfCampaignPanel extends AbstractHqPanel {
    private headline: TextBox;
    private bodyText: TextBox;

    constructor(scene: Scene) {
        super(scene, 'The Board Convenes');
        this.titleText.setVisible(false); // replaced by the minutes' letterhead

        const dim = drawBackdropDim(scene, 0.6);
        this.add(dim);

        const sheet = scene.add.container(scene.scale.width / 2, scene.scale.height / 2);
        sheet.add(drawPaper(scene, MINUTES_W, MINUTES_H, false));

        sheet.add(scene.add.text(0, -MINUTES_H / 2 + 30, 'MINUTES OF THE BOARD', {
            fontFamily: Fonts.DISPLAY, fontSize: '20px', color: Palette.INK_FADED,
        }).setOrigin(0.5));

        const rule = scene.add.graphics();
        rule.lineStyle(1, Palette.PAPER_SHADOW, 0.5);
        rule.lineBetween(-MINUTES_W / 2 + 40, -MINUTES_H / 2 + 56, MINUTES_W / 2 - 40, -MINUTES_H / 2 + 56);
        sheet.add(rule);

        this.headline = new TextBox({
            scene,
            x: 0,
            y: -MINUTES_H / 2 + 108,
            width: MINUTES_W - 80,
            height: 60,
            text: '',
            fillColor: Palette.PAPER,
            style: { fontSize: '32px', fontFamily: Fonts.DISPLAY, color: Palette.CRIMSON_TEXT, align: 'center' }
        });
        this.headline.setStroke(false);
        sheet.add(this.headline);

        this.bodyText = new TextBox({
            scene,
            x: 0,
            y: 10,
            width: MINUTES_W - 120,
            height: 360,
            text: '',
            fillColor: Palette.PAPER,
            style: { fontSize: '19px', fontFamily: Fonts.BODY, color: Palette.INK, wordWrap: { width: MINUTES_W - 140 } }
        });
        this.bodyText.setStroke(false);
        sheet.add(this.bodyText);

        const newCampaignButton = new TextBoxButton({
            scene,
            x: 0,
            y: MINUTES_H / 2 - 56,
            width: 300,
            height: 58,
            text: 'New Campaign',
            style: { fontSize: '20px', fontFamily: Fonts.DISPLAY, color: Palette.WHITE },
            fillColor: Palette.VERDIGRIS
        });
        newCampaignButton.onClick(() => {
            SaveManager.deleteSave();
            window.location.reload();
        });
        sheet.add(newCampaignButton);

        this.add(sheet);
    }

    public show(): void {
        const campaign = CampaignUiState.getInstance();
        const gameState = GameState.getInstance();
        const cal = campaign.calendar;

        const victoryPoints = campaign.ownedStrategicProjects
            .reduce((sum, p) => sum + p.getVictoryPoints(), 0);
        const finalScore = victoryPoints + gameState.moneyInVault;

        const stats =
            `Weeks in charge: ${cal.week - 1}\n` +
            `Contracts fulfilled: ${campaign.contractsCompleted}\n` +
            `Soldiers on the books: ${campaign.roster.length}\n\n` +
            `Vault: £${gameState.moneyInVault}\n` +
            `Victory points from ventures: ${victoryPoints}\n\n` +
            `FINAL SCORE: ${finalScore}`;

        if (cal.isSacked) {
            this.headline.setText('SERVICES NO LONGER REQUIRED');
            this.bodyText.setText(
                `The shareholders have voted. A junior man from Accounts collects your ledger, ` +
                `your seal, and your keys to the gate. The Company persists; you do not.\n\n${stats}`
            );
        } else {
            this.headline.setText('CHARTER COMPLETE');
            this.bodyText.setText(
                `${CHARTER_YEARS} years of trans-dimensional commerce, concluded to the ` +
                `satisfaction of the board. There is talk of a statue. There is always talk.\n\n${stats}`
            );
        }

        super.show();
    }

    update(): void {
        // Terminal screen; nothing to refresh.
    }
}
