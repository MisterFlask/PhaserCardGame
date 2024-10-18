// src/ui/TextBox.ts
import Phaser from 'phaser';

// Modify the class to extend Phaser.GameObjects.Container
export class TextBox extends Phaser.GameObjects.Container {
    protected background: Phaser.GameObjects.Rectangle ;
    protected backgroundImage: Phaser.GameObjects.Image | null = null;
    protected text: Phaser.GameObjects.Text;
    protected outline: Phaser.GameObjects.Rectangle | null = null;
    textBoxName?: string;
    expandDirection: 'up' | 'down';
    private debugGraphics: Phaser.GameObjects.Graphics;

    constructor(params: {
        scene: Phaser.Scene,
        x?: number,
        y?: number,
        width?: number,
        height?: number,
        text?: string,
        style?: Phaser.Types.GameObjects.Text.TextStyle,
        backgroundImage?: string,
        textBoxName?: string,
        fillColor?: number,
        expandDirection?: 'up' | 'down'
    }) {
        const {
            scene,
            x = 0,
            y = 0,
            width = 150,
            height = 60,
            text = '',
            style = { fontSize: '18px', color: '#ffffff', fontFamily: 'Verdana' },
            backgroundImage,
            textBoxName,
            fillColor = 0x2e2e2e
        } = params;

        super(scene, x, y);

        // **Set the origin of the container to the center**
        this.setOrigin(0.5, 0.5);

        this.textBoxName = textBoxName ?? "anonymousTextBox";
        this.expandDirection = params.expandDirection ?? 'down';
        
        this.background = scene.add.rectangle(0, 0, width, height, fillColor)
            .setStrokeStyle(2, 0xffffff)
            // **Center the background rectangle**
            .setOrigin(0.5, 0.5);
        this.add(this.background);
        

        this.text = scene.add.text(0, 0, text, {
            ...style,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            resolution: 1,
        })
        .setOrigin(0.5, 0.5) // **Center the text**
        .setWordWrapWidth(width - 20)
        .setAlign('center')
        .setShadow(2, 2, '#000000', 2, false, true);
        this.add(this.text);

        this.adjustTextBoxSize();

        // Add the container to the scene
        scene.add.existing(this);

        // Initialize debug graphics
        this.debugGraphics = this.scene.add.graphics();
        this.debugGraphics.setVisible(true); // Set to false to hide debug hitboxes
        this.add(this.debugGraphics);
    }

    setOrigin(x: number, y?: number): this {
        y = y ?? x;
        if (this.text) {
            this.text.setOrigin(x, y);
        }
        if (this.background) {
            this.background.setOrigin(x, y);
        }
        if (this.backgroundImage) {
            this.backgroundImage.setOrigin(x, y);
        }
        return this;
    }


    pulseGreenBriefly(): void {
        this.pulseColor(0x00ff00);
    }

    pulseRedBriefly(): void {
        this.pulseColor(0xff0000);
    }


    getText(): string {
        return this.text.text;
    }

    pulseColor(color: number): void {
        if (this.background) {
            const originalColor = this.background.fillColor;
            this.scene.tweens.add({
                targets: this.background,
                fillColor: { from: originalColor, to: color },
                duration: 100,
                yoyo: true,
                repeat: 3,
                onComplete: () => {
                    this.background?.setFillStyle(originalColor);
                }
            });
        }
    }


    // Override setInteractive
    override setInteractive(hitArea?: any, callback?: any, dropZone?: boolean): this {
        const { width, height } = this.calculateBoundingBox();
        return super.setInteractive(this.background, Phaser.Geom.Rectangle.Contains, dropZone);
    }

    setText(text: string): void {
        if (this.text.scene === null) {
            return;
        }
        if (this.background == null && this.backgroundImage == null){
            return;
        }
        if ((this.text.frame as any)?.data) {
            this.text.setText(text);
            this.adjustTextBoxSize();
        } else{
            console.log("text frame data is null for " + this.textBoxName);
        }
    }

    private adjustTextBoxSize(): void {
        const padding = 10;
        const target = this.backgroundImage || this.background;
        if (!target) return;

        let newWidth = Math.max(target.width, this.text.width + padding * 2);
        let newHeight = Math.max(target.height, this.text.height + padding * 2);

        if (newWidth > target.width || newHeight > target.height) {
            const widthIncrease = newWidth - target.width;
            const heightIncrease = newHeight - target.height;
            
            target.setSize(newWidth, newHeight);
            
            if (this.expandDirection === 'down') {
                this.y += heightIncrease / 2;
            } else {
                this.y -= heightIncrease / 2;
            }

            this.text.setWordWrapWidth(newWidth - padding * 2);
        }

        this.setSize(newWidth, newHeight);
    }

    destroy(): void {
        if (this.background) {
            this.background.destroy();
        }
        if (this.backgroundImage) {
            this.backgroundImage.destroy();
        }
        this.text.destroy();
        this.backgroundImage = null;
        super.destroy();
    }


    /**
     * Makes the TextBox interactive with a predefined hit area based on its size.
     * @param callback The function to call when the TextBox is interacted with.
     */
    public makeInteractive(callback: () => void): void {
        const { width, height } = this.calculateBoundingBox();
        const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
        this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', callback);
    }

    // Add the update method to refresh the hitbox each frame
    update(): void {
        const { width, height } = this.calculateBoundingBox();
        const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
        this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains, true);

        // Draw debug hitbox if enabled
        if (this.debugGraphics.visible) {
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(2, 0xff0000, 1); // Red color for visibility
            this.debugGraphics.strokeRect(hitArea.x, hitArea.y, hitArea.width, hitArea.height);
            // Ensure debug graphics are drawn on top
            this.debugGraphics.setDepth(1000);
        }
    }

    // Consolidate bounding box calculation into its own method
    protected calculateBoundingBox(): { width: number; height: number } {
        const target = this.background;
        if (!target) {
            throw new Error(`TextBox "${this.textBoxName}" has no background to calculate bounding box.`);
        }
        const { displayWidth: width, displayHeight: height } = target;
        return { width, height };
    }
}
