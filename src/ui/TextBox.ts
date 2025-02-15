// src/ui/TextBox.ts
import Phaser from 'phaser';
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';

import { TextGlyphs } from '../text/TextGlyphs';
import { DepthManager } from './DepthManager';

export type VerticalExpand = 'up' | 'down';
export type HorizontalExpand = 'left' | 'right'| 'center';
export type AreaEventHandler = (key: string) => void;

export interface TextBoxConfig {
    scene: Phaser.Scene;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text: string;
    style?: Phaser.Types.GameObjects.Text.TextStyle;
    fillColor?: number;
    parseAreaTags?: boolean;
}

export class TextBox extends Phaser.GameObjects.Container {
    public static readonly YELLOW = 0xFFFF00;
    public static readonly GREEN = 0x00FF00;
    public static readonly RED = 0xFF0000;
    public static readonly ORANGE = 0xFFA500;
    public static readonly MAGENTA = 0xFF00FF;

    protected background: Phaser.GameObjects.Rectangle ;
    protected backgroundImage: Phaser.GameObjects.Image | null = null;
    protected text: BBCodeText;
    textBoxName?: string;
    protected verticalExpand: VerticalExpand;
    protected horizontalExpand: HorizontalExpand;
    private debugGraphics: Phaser.GameObjects.Graphics;
    protected fillColor: number;
    protected assignedWidth: number;
    private areaElements: Map<string, Phaser.GameObjects.Container> = new Map();

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

    // Add new properties to store event handlers
    private areaEventHandlers: {
        click?: AreaEventHandler;
        down?: AreaEventHandler;
        over?: AreaEventHandler;
        out?: AreaEventHandler;
    } = {};

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
        verticalExpand?: VerticalExpand,
        horizontalExpand?: HorizontalExpand,
        bigTextOverVariableColors?: boolean,
        strokeIsOn?: boolean,
        parseAreaTags?: boolean,
        interactive?: boolean
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
            verticalExpand = 'down',
            horizontalExpand = 'right',
            bigTextOverVariableColors = false,
            strokeIsOn = true,
            parseAreaTags = false,
            interactive = false
        } = params;

        super(scene, x, y);
        this.strokeIsOn = strokeIsOn;
        // **Set the origin of the container to the center**
        this.setOrigin(0,0);

        this.textBoxName = textBoxName ?? "anonymousTextBox";
        this.verticalExpand = verticalExpand;
        this.horizontalExpand = horizontalExpand;
        
        this.assignedWidth = width;

        this.background = scene.add.rectangle(0, 0, this.assignedWidth, height, fillColor)
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
                width: width,
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
            interactive: interactive,
            resolution: 4
        };

        // Create the text object
        this.text = scene.add.rexBBCodeText(0, 0, text ?? ".", textStyle)
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
        this.text.addImage(TextGlyphs.getInstance().ASHES_ICON_RAW, {...imageConfig, key: TextGlyphs.getInstance().ASHES_ICON_RAW});
        this.text.addImage(TextGlyphs.getInstance().VENTURE_ICON_RAW, {...imageConfig, key: TextGlyphs.getInstance().VENTURE_ICON_RAW});
        this.text.addImage(TextGlyphs.getInstance().PLUCK_ICON_RAW, {...imageConfig, key: TextGlyphs.getInstance().PLUCK_ICON_RAW});
        this.text.addImage(TextGlyphs.getInstance().BLOOD_ICON_RAW, {...imageConfig, key: TextGlyphs.getInstance().BLOOD_ICON_RAW});
        this.text.addImage(TextGlyphs.getInstance().SMOG_ICON_RAW, {...imageConfig, key: TextGlyphs.getInstance().SMOG_ICON_RAW});
        
        // Remove the immediate setBackgroundColor call
        // this.text.setBackgroundColor(fillColor);
        // Remove hardcoded stroke and shadow settings
        // this.text.setShadow(-2, -2, "black", 2, true, true);
        // this.text.setStroke("black", 5);
        // this.text.setShadowStroke(true);
        this.add(this.text);

        // Adjust the text box size (ensure it starts with correct size)
        this.adjustTextBoxSize();

        // Add the container to the scene
        scene.add.existing(this);

        // Initialize debug graphics
        this.debugGraphics = this.scene.add.graphics();
        this.debugGraphics.setVisible(true); // Set to false to hide debug hitboxes
        this.add(this.debugGraphics);

        
        this.text
            .on('areadown', this.handleAreaDown, this)
            .on('areaclick', this.handleAreaClick, this)
            .on('areaover', this.handleAreaOver, this)
            .on('areaout', this.handleAreaOut, this);

        
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
            // Determine outline color based on background color lightness
            const outlineColor = this.isColorLight(color) ? 0x000000 : 0xFFFFFF;
            this.background.setStrokeStyle(2, outlineColor);
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


        text = text ?? ".";

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
    
    private previousWordWrapWidth: number = 0;
    private previousTextWidth: number = 0;
    private previousTextHeight: number = 0;
    
    private adjustTextBoxSize(): void {
        const padding = 10;
        const target = this.backgroundImage || this.background;
        if (!target) return;
    
        // Ensure the target's width is at least the assigned width
        if (target.width < this.assignedWidth) {
            target.width = this.assignedWidth;
        }
    
        // Calculate desired word wrap width using assignedWidth
        const desiredWordWrapWidth = this.assignedWidth - padding * 2;
    
        try{
            
        // Only update word wrap width if it has changed
        if (this.previousWordWrapWidth !== desiredWordWrapWidth) {
                this.text.setWordWrapWidth(desiredWordWrapWidth);
                this.previousWordWrapWidth = desiredWordWrapWidth;
            }
        } catch (error) {
            console.warn("Error adjusting text box size:", error);
        }
    
        // Measure text dimensions
        const newTextWidth = this.text.width;
        const newTextHeight = this.text.height;
    
        // Only update background size if text dimensions have changed
        if (newTextWidth !== this.previousTextWidth || newTextHeight !== this.previousTextHeight) {
            const oldWidth = target.width;
            const oldHeight = target.height;
    
            // Ensure the new width is at least the assignedWidth
            const newWidth = Math.max(newTextWidth + padding * 2, this.assignedWidth);
            const newHeight = newTextHeight + padding * 2;
    
            // Set the new size of the background
            target.setSize(newWidth, newHeight);
    
            // Adjust position based on expansion directions
            if (this.verticalExpand === 'down') {
                this.y += (newHeight - oldHeight) / 2;
            } else { // 'up'
                this.y -= (newHeight - oldHeight) / 2;
            }
    
            if (this.horizontalExpand === 'right') {
                this.x += (newWidth - oldWidth) / 2;
            } else if (this.horizontalExpand === 'left') {
                this.x -= (newWidth - oldWidth) / 2;
            }
            // 'center' requires no position adjustment
    
            // Update the container size
            this.setSize(newWidth, newHeight);
    
            // Cache the new dimensions
            this.previousTextWidth = newTextWidth;
            this.previousTextHeight = newTextHeight;
        }
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

    // Add methods to change expansion direction at runtime
    setVerticalExpand(direction: VerticalExpand): void {
        this.verticalExpand = direction;
        this.adjustTextBoxSize(); // Readjust size with new direction
    }

    setHorizontalExpand(direction: HorizontalExpand): void {
        this.horizontalExpand = direction;
        this.adjustTextBoxSize(); // Readjust size with new direction
    }

    // Add new public methods to set event handlers
    public onAreaClick(handler: AreaEventHandler): void {
        this.areaEventHandlers.click = handler;
    }

    public onAreaDown(handler: AreaEventHandler): void {
        this.areaEventHandlers.down = handler;
    }

    public onAreaOver(handler: AreaEventHandler): void {
        this.areaEventHandlers.over = handler;
    }

    public onAreaOut(handler: AreaEventHandler): void {
        this.areaEventHandlers.out = handler;
    }

    // Add private handler methods
    private handleAreaClick(key: string): void {
        console.log("Area clicked: " + key);
        this.areaEventHandlers.click?.(key);
    }

    private handleAreaDown(key: string): void {
        console.log("Area down: " + key);   
        this.areaEventHandlers.down?.(key);
    }

    private handleAreaOver(key: string): void {
        console.log("Area over: " + key);
        this.areaEventHandlers.over?.(key);
    }

    private handleAreaOut(key: string): void {
        console.log("Area out: " + key);
        this.areaEventHandlers.out?.(key);
    }

    // Modify the destroy method to remove event listeners
    override destroy(): void {
        if (this.text) {
            this.text.off('areadown', this.handleAreaDown, this);
            this.text.off('areaclick', this.handleAreaClick, this);
            this.text.off('areaover', this.handleAreaOver, this);
            this.text.off('areaout', this.handleAreaOut, this);
        }
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
}
