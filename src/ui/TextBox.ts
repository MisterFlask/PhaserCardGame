// src/ui/TextBox.ts
import Phaser from 'phaser';
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';

import { DepthManager } from './DepthManager';

// Modify the class to extend Phaser.GameObjects.Container
export class TextBox extends Phaser.GameObjects.Container {

    public static readonly YELLOW = 0xFFFF00;
    public static readonly GREEN = 0x00FF00;
    public static readonly RED = 0xFF0000;
    public static readonly ORANGE = 0xFFA500;
    public static readonly MAGENTA = 0xFF00FF;

    private isVisible: boolean = true;
    protected background: Phaser.GameObjects.Rectangle ;
    protected backgroundImage: Phaser.GameObjects.Image | null = null;
    protected text: BBCodeText;
    protected outline: Phaser.GameObjects.Rectangle | null = null;
    textBoxName?: string;
    expandDirection: 'up' | 'down';
    private debugGraphics: Phaser.GameObjects.Graphics;
    protected fillColor: number;

    // Add a method to determine if a color is light
    private isColorLight(color: number): boolean {
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;
        // Calculate brightness using the YIQ formula
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 127;
    }

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
        expandDirection?: 'up' | 'down',
        bigTextOverVariableColors?: boolean
    }) {
        const {
            scene,
            x = 0,
            y = 0,
            width = 150,
            height = 60,
            text = '',
            style = { fontSize: '22px', fontFamily: 'Verdana' },
            backgroundImage,
            textBoxName,
            fillColor = 0x2e2e2e,
            bigTextOverVariableColors = false
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
        

        this.fillColor = fillColor;

        // Determine if the background color is light
        const isLightBackground = this.isColorLight(this.fillColor);

        // Set text color based on background brightness
        const textColor = isLightBackground ? '#000000' : '#FFFFFF';
        const strokeColor = isLightBackground ? '#FFFFFF' : '#000000';
        const shadowColor = isLightBackground ? '#AAAAAA' : '#222222';

        // Modify the text style to include dynamic colors
        const textStyle: any = {
            backgroundColor:fillColor,
            wrap: {
                mode: 'word',
                width: 200
            },
            fontSize: style.fontSize,
            fontFamily: style.fontFamily,

            color: textColor,
            stroke: strokeColor,
            strokeThickness: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                blur: 2,
                color: shadowColor,
                fill: true,
                stroke: true,
            },

            underline: {
                color: '#000',
                thickness: 2,
                offset: 1
            },

            strikethrough: {
                color: 'black',
                thickness: 2,
                offset: -8
            }
        };

        // Create the text object
        this.text = scene.add.rexBBCodeText(0, 0, text, textStyle)
            .setOrigin(0.5, 0.5);
        // Remove the immediate setBackgroundColor call
        // this.text.setBackgroundColor(fillColor);
        // Remove hardcoded stroke and shadow settings
        // this.text.setShadow(-2, -2, "black", 2, true, true);
        // this.text.setStroke("black", 5);
        // this.text.setShadowStroke(true);
        this.add(this.text);

        // Adjust the text box size
        this.adjustTextBoxSize();

        // Add the container to the scene
        scene.add.existing(this);

        // Initialize debug graphics
        this.debugGraphics = this.scene.add.graphics();
        this.debugGraphics.setVisible(true); // Set to false to hide debug hitboxes
        this.add(this.debugGraphics);
        
        // Set the background color after text is set
        try{
            this.text.setBackgroundColor("transparent");
        } catch (error) {
            console.warn("Error setting background color for " + this.textBoxName, error);
        }
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

    setBackgroundColor(color: number): void {
        if (this.background) {
            this.background.setFillStyle(color);
        }
        this.fillColor = color; // Store the color for later use

    }


    getText(): string {
        return this.text.text;
    }

    pulseColor(color: number): void {
        if (this.background) {
            const originalColor = this.background?.fillColor;
            this.scene?.tweens?.add({
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

    setFillColor(color: number): void {
        if (this.background) {
            this.background.setFillStyle(color);
        }
    }

    setText(text: string): void {
        if (this.text.scene?.sys === null) {
            return;
        }
        if (this.background == null && this.backgroundImage == null) {
            return;
        }
        // Wrap the text in shadow tags
        const textWithShadow = `[stroke][bgcolor=rgba(255,0,0,0)][shadow]${text}[/shadow][/bgcolor][/stroke]`;
        this.text.setText(textWithShadow);

        this.adjustTextBoxSize();
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

        if (this.debugGraphics.visible) {
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(2, 0xff0000, 1);
            this.debugGraphics.strokeRect(hitArea.x, hitArea.y, hitArea.width, hitArea.height);
            this.debugGraphics.setDepth(DepthManager.getInstance().TOOLTIP);
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
