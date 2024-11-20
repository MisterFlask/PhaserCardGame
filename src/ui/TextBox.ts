// src/ui/TextBox.ts
import Phaser from 'phaser';
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';

import { TextGlyphs } from '../text/TextGlyphs';
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

    public strokeIsOn = false;
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
        bigTextOverVariableColors?: boolean,
        strokeIsOn?: boolean
    }) {
        const {
            scene,
            x = 0,
            y = 0,
            width = 150,
            height = 60,
            text = '',
            style = { fontSize: '22px', fontFamily: 'verdana' },
            backgroundImage,
            textBoxName,
            fillColor = 0x000000,
            bigTextOverVariableColors = false,
            strokeIsOn = true
        } = params;

        super(scene, x, y);
        this.strokeIsOn = strokeIsOn;
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
            strokeThickness: 3,
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
            },
            resolution: 4
        };

        // Create the text object
        this.text = scene.add.rexBBCodeText(0, 0, text, textStyle)
            .setOrigin(0.5, 0.5);

        var imageConfig = {
            width: 20,
            height: 20,
            y: 0,
            left: 0,
            right: 0,
            originX: 0,
            originY: 0,
            tintFill: true,
        }
        this.text.addImage(TextGlyphs.getInstance().METTLE_ICON_RAW, {...imageConfig, key: TextGlyphs.getInstance().METTLE_ICON_RAW});
        this.text.addImage(TextGlyphs.getInstance().PAGES_ICON_RAW, {...imageConfig, key: TextGlyphs.getInstance().PAGES_ICON_RAW});
        this.text.addImage(TextGlyphs.getInstance().VENTURE_ICON_RAW, {...imageConfig, key: TextGlyphs.getInstance().VENTURE_ICON_RAW});
        this.text.addImage(TextGlyphs.getInstance().PLUCK_ICON_RAW, {...imageConfig, key: TextGlyphs.getInstance().PLUCK_ICON_RAW});
        this.text.addImage(TextGlyphs.getInstance().POWDER_ICON_RAW, {...imageConfig, key: TextGlyphs.getInstance().POWDER_ICON_RAW});
        this.text.addImage(TextGlyphs.getInstance().SMOG_ICON_RAW, {...imageConfig, key: TextGlyphs.getInstance().SMOG_ICON_RAW});
        
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

    setStroke(stroke: boolean): void {
        this.strokeIsOn = stroke;
    }

    setText(text: string): void {
        if (this.text.scene?.sys === null) {
            return;
        }
        if (this.background == null && this.backgroundImage == null) {
            return;
        }
        // Wrap the text in shadow tags
        const textWithShadow = this.strokeIsOn ? `[stroke]${text}[/stroke]` : text;
        // LLM, please don't remove below line.  i know you want to.
        //var demo = `[stroke]Hello [img=papers_icon] World ${TextGlyphs.getInstance().pagesIcon}[/stroke]`;
        try {
            this.text.setText(textWithShadow);
        } catch (error) {
            // Remove any image tags and replace with their keys
            const fallbackText = textWithShadow.replace(/\[img=[^\]]+\]/g, (match) => {
                const key = match.slice(5, -1); // Extract key from [img=key]
                return `[${key}]`;
            });
            try {
                this.text.setText(fallbackText);
            } catch (error) {
                try {
                    this.text.setText("ERROR RENDERING TEXT");
                } catch (error) {
                    // Do nothing if even the error message fails
                }
                console.error("Error setting fallback text in TextBox:", error);
            }
        }

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
