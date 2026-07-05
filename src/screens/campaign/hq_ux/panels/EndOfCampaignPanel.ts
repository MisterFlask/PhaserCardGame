import { Scene } from 'phaser';
import { CHARTER_YEARS } from '../../../../campaign/CampaignCalendar';
import { GameState } from '../../../../rules/GameState';
import { SaveManager } from '../../../../saveload/SaveManager';
import { TextBoxButton } from '../../../../ui/Button';
import { TextBox } from '../../../../ui/TextBox';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

/**
 * Terminal screen for both campaign endings: sacked by the board
 * (satisfaction 0) or charter expiry (score screen). No way back except
 * starting a new campaign.
 */
export class EndOfCampaignPanel extends AbstractHqPanel {
    private headline: TextBox;
    private bodyText: TextBox;

    constructor(scene: Scene) {
        super(scene, 'The Board Convenes');

        // No escaping to the hub from an ending.
        this.returnButton.setVisible(false);

        this.headline = new TextBox({
            scene,
            x: scene.scale.width / 2,
            y: 180,
            width: 900,
            height: 60,
            text: '',
            style: { fontSize: '36px', color: '#ffdd88' }
        });

        this.bodyText = new TextBox({
            scene,
            x: scene.scale.width / 2,
            y: scene.scale.height / 2,
            width: 800,
            height: 360,
            text: '',
            style: { fontSize: '20px', color: '#ffffff', wordWrap: { width: 780 } }
        });

        const newCampaignButton = new TextBoxButton({
            scene,
            x: scene.scale.width / 2,
            y: scene.scale.height - 150,
            width: 280,
            height: 60,
            text: 'New Campaign',
            style: { fontSize: '22px', color: '#ffffff' },
            fillColor: 0x226622
        });
        newCampaignButton.onClick(() => {
            SaveManager.deleteSave();
            window.location.reload();
        });

        this.add([this.headline, this.bodyText, newCampaignButton]);
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
