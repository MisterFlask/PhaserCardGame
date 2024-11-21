import { TextBox } from './TextBox';

export class SubtitleManager {
    private static instance: SubtitleManager;
    private scene: Phaser.Scene;
    private subtitleTextBox?: TextBox;

    private constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public static setInstance(scene: Phaser.Scene): void {
        SubtitleManager.instance = new SubtitleManager(scene);
    }

    public static getInstance(scene?: Phaser.Scene): SubtitleManager {
        if (!SubtitleManager.instance) {
            if (!scene) {
                throw new Error('Scene must be provided when initializing SubtitleManager');
            }
            SubtitleManager.instance = new SubtitleManager(scene);
        }
        return SubtitleManager.instance;
    }

    public async showSubtitle(text: string): Promise<void> {
        if (!this.subtitleTextBox) {
            this.subtitleTextBox = new TextBox({
                scene: this.scene,
                x: this.scene.scale.width / 2,
                y: 50,
                width: 400,
                height: 50,
                text: text,
                style: { fontSize: '24px', color: '#ffffff' },
                verticalExpand: 'down',
                horizontalExpand: 'right'
            });
            this.subtitleTextBox.setDepth(100); // Ensure it's on top
        } else {
            this.subtitleTextBox.setText(text);
            this.subtitleTextBox.setVisible(true);
        }

        // Reset scale before playing new pulse animation
        this.subtitleTextBox.setScale(1);
        
        // Play pulse animation
        this.scene.tweens.add({
            targets: this.subtitleTextBox,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeInOut'
        });
    }

    public async hideSubtitle(): Promise<void> {
        if (this.subtitleTextBox) {
            this.subtitleTextBox.setVisible(false);
        }
    }

    public updateLayout(width: number): void {
        if (this.subtitleTextBox) {
            this.subtitleTextBox.setPosition(width / 2, 50);
        }
    }
}