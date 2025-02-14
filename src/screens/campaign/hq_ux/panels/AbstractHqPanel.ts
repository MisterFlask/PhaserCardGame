import { Scene } from 'phaser';
import { TextBoxButton } from '../../../../ui/Button';
import { TextBox } from '../../../../ui/TextBox';

export abstract class AbstractHqPanel extends Phaser.GameObjects.Container {
    protected titleText: TextBox;
    protected returnButton: TextBoxButton;
    protected title: string;
    constructor(scene: Scene, title: string) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.title = title;

        // Add title
        this.titleText = new TextBox({
            scene,
            x: scene.scale.width / 2,
            y: 30,
            width: 300,
            height: 50,
            text: title,
            style: { fontSize: '24px', color: '#ffffff' }
        });

        // Add return button
        this.returnButton = new TextBoxButton({
            scene,
            x: 100,
            y: 30,
            width: 150,
            height: 40,
            text: 'Return to Hub',
            style: { fontSize: '16px', color: '#ffffff' },
            fillColor: 0x444444
        });

        this.returnButton.onClick(() => this.returnToHub());

        this.add([this.titleText, this.returnButton]);
    }

    protected returnToHub(): void {
        this.scene.events.emit('returnToHub');
    }

    public show(): void {
        this.titleText.setText(this.title)
        this.setVisible(true);
        this.setActive(true);
    }

    public hide(): void {
        this.setVisible(false);
        this.setActive(false);
    }

    abstract update(): void;
} 