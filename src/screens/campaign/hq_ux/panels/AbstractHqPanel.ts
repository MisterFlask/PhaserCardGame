import { Scene } from 'phaser';
import { TextBox } from '../../../../ui/TextBox';

export abstract class AbstractHqPanel extends Phaser.GameObjects.Container {
    protected titleText: TextBox;
    protected title: string;
    protected backgroundImage?: Phaser.GameObjects.Image;

    constructor(scene: Scene, title: string, backgroundImageKey?: string) {
        super(scene, 0, 0);
        scene.add.existing(this);

        if (!backgroundImageKey) {
            backgroundImageKey = "investments-screen-oil-painting"
        }

        this.title = title;

        // Add background image if provided
        if (backgroundImageKey) {
            this.backgroundImage = scene.add.image(0, 0, backgroundImageKey)
                .setOrigin(0, 0)
                .setDisplaySize(scene.scale.width, scene.scale.height)
                .setDepth(-1); // Set a negative depth to ensure it stays below other elements
            this.add(this.backgroundImage);
        }

        // Add title (the tab rail now names the current view for most
        // panels; individual panels may hide this via titleText.setVisible(false)
        // if the chrome already covers it).
        this.titleText = new TextBox({
            scene,
            x: scene.scale.width / 2,
            y: 30,
            width: 300,
            height: 50,
            text: title,
            style: { fontSize: '24px', color: '#ffffff' }
        });

        this.add([this.titleText]);
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