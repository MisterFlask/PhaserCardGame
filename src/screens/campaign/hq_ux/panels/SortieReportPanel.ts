import { Scene } from 'phaser';
import { SortieManager } from '../../../../campaign/SortieManager';
import { TextBoxButton } from '../../../../ui/Button';
import { TextBox } from '../../../../ui/TextBox';
import { AbstractHqPanel } from './AbstractHqPanel';

/**
 * Post-sortie debrief: shown once on returning to the HQ, before the hub.
 * The emotional beat of the loop — payouts, wounds, and the dead get a
 * moment on screen instead of a sidebar footnote.
 */
export class SortieReportPanel extends AbstractHqPanel {
    private reportText: TextBox;

    constructor(scene: Scene) {
        super(scene, 'Expedition Debrief');

        this.returnButton.setVisible(false);

        this.reportText = new TextBox({
            scene,
            x: scene.scale.width / 2,
            y: scene.scale.height / 2 - 40,
            width: 900,
            height: 400,
            text: '',
            style: { fontSize: '20px', color: '#ffffff', wordWrap: { width: 880 } }
        });

        const continueButton = new TextBoxButton({
            scene,
            x: scene.scale.width / 2,
            y: scene.scale.height - 170,
            width: 260,
            height: 55,
            text: 'File the Report',
            style: { fontSize: '20px', color: '#ffffff' },
            fillColor: 0x226622
        });
        continueButton.onClick(() => {
            SortieManager.getInstance().hasUnviewedReport = false;
            this.scene.events.emit('returnToHub');
        });

        this.add([this.reportText, continueButton]);
    }

    public show(): void {
        const report = SortieManager.getInstance().lastSortieReport;
        this.reportText.setText(report.length > 0 ? report.join('\n\n') : 'Nothing to report.');
        super.show();
    }

    update(): void {
        // Static; dismissed by the button.
    }
}
