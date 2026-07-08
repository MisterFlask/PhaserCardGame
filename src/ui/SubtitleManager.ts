import { TextBox } from './TextBox';

export class SubtitleManager {
    private static instance: SubtitleManager;
    // Optional: headless combat (src/combat/sim/HeadlessCombat.ts) runs turn
    // resolution (enemy intent narration goes through displaySubtitle) with
    // no live scene at all. Mirrors AbstractIntent.isUsingPlaceholderImage's
    // scene-optional guard.
    private scene?: Phaser.Scene;
    private subtitleTextBox?: TextBox;
    private portraitImage?: Phaser.GameObjects.Image;

    private constructor(scene?: Phaser.Scene) {
        this.scene = scene;
    }

    public static setInstance(scene: Phaser.Scene): void {
        SubtitleManager.instance = new SubtitleManager(scene);
    }

    /** Headless combat has no scene to construct a UI-backed instance with;
     *  this creates a no-op-capable manager instead of throwing. Safe to
     *  call repeatedly (e.g. once per simulated combat) -- only takes
     *  effect if no instance (headless or scene-backed) already exists, so
     *  it won't clobber a real scene's manager if one is somehow live. */
    public static initHeadless(): void {
        if (!SubtitleManager.instance) {
            SubtitleManager.instance = new SubtitleManager(undefined);
        }
    }

    public static isInitialized(): boolean {
        return !!SubtitleManager.instance;
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

    public async showSubtitle(text: string, portraitKey?: string): Promise<void> {
        if (!this.scene) {
            return;
        }
        const centerX = this.scene.scale.width / 2;
        const subtitleWidth = 400;
        const portraitSize = 50; // adjust as needed
        const padding = 10;

        // if a portrait is specified and not yet created, create it.
        // if not specified, ensure no portrait is visible.
        if (portraitKey) {
            if (!this.portraitImage) {
                this.portraitImage = this.scene.add.image(centerX - (subtitleWidth / 2) - portraitSize - padding, 50, portraitKey)
                    .setOrigin(0.5)
                    .setScale(portraitSize / 100); // scale accordingly
                this.portraitImage.setDepth(100);
            } else {
                this.portraitImage.setTexture(portraitKey);
                this.portraitImage.setVisible(true);
                this.portraitImage.setPosition(centerX - (subtitleWidth / 2) - portraitSize - padding, 50);
            }
        } else {
            if (this.portraitImage) {
                this.portraitImage.setVisible(false);
            }
        }

        if (!this.subtitleTextBox) {
            this.subtitleTextBox = new TextBox({
                scene: this.scene,
                x: centerX,
                y: 50,
                width: subtitleWidth,
                height: 50,
                text: text,
                style: { fontSize: '24px', color: '#ffffff' },
                verticalExpand: 'down',
                horizontalExpand: 'right'
            });
            this.subtitleTextBox.setDepth(100);
        } else {
            this.subtitleTextBox.setText(text);
            this.subtitleTextBox.setVisible(true);
            this.subtitleTextBox.setPosition(centerX, 50);
        }

        this.subtitleTextBox.setScale(1);

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
        if (this.portraitImage) {
            this.portraitImage.setVisible(false);
        }
    }

    public updateLayout(width: number): void {
        if (this.subtitleTextBox) {
            const centerX = width / 2;
            this.subtitleTextBox.setPosition(centerX, 50);

            // re-position portrait if visible
            if (this.portraitImage && this.portraitImage.visible) {
                const subtitleWidth = 400;
                const portraitSize = this.portraitImage.displayWidth || 50;
                const padding = 10;
                this.portraitImage.setPosition(centerX - (subtitleWidth / 2) - portraitSize - padding, 50);
            }
        }
    }
}
