// src/ui/TextBox.ts
import Phaser from 'phaser';

export class TextBox {
    background: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image | null;
    text: Phaser.GameObjects.Text;
    outline: Phaser.GameObjects.Rectangle | null = null;
    textBoxName?: string;
    scene: Phaser.Scene;
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
        fillColor?: number
    }) {
        const {
            scene,
            x = 0,
            y = 0,
            width = 150,
            height = 60,
            text = '',
            style = { fontSize: '18px', color: '#ffffff', fontFamily: 'Arial' },
            backgroundImage,
            textBoxName,
            fillColor = 0x2e2e2e
        } = params;
        this.textBoxName = textBoxName ?? "anonymousTextBox";
        this.scene = scene;
        // Create background with rounded corners if no image is provided
        if (backgroundImage) {
            this.background = scene.add.image(x, y, backgroundImage).setDisplaySize(width, height).setOrigin(0.5);
        } else {
            this.background = scene.add.rectangle(x, y, width, height, fillColor).setOrigin(0.5);
            this.background.setStrokeStyle(2, 0xffffff); // Adding a border for better visibility
        }

        // Create text with shadow for better readability
        this.text = scene.add.text(x, y, text, {
            ...style,
            color: '#ffffff', // Explicitly set color to white
            stroke: '#000000', // Change stroke to black for better contrast
           
            strokeThickness: 2,
            // Shadows are set separately
        });
        this.text.setOrigin(0.5);
        this.text.setWordWrapWidth(width - 20);
        this.text.setAlign('center');
        this.text.setShadow(2, 2, '#000000', 2, false, true); // offsetX, offsetY, color, blur, shadowStroke, shadowFill

        // Adjust text size if it overflows
        const originalFontSize = parseInt(style.fontSize as string);
        let currentFontSize = originalFontSize;
        while ((this.text.height > height - 10 || this.text.width > width - 10) && currentFontSize > 10) { // Minimum font size of 10
            currentFontSize--;
            this.text.setFontSize(currentFontSize);
            this.text.setWordWrapWidth(width - 20);
        }
    }

    setPosition(x: number, y: number): void {
        if (this.background === null) return;
        this.background.setPosition(x, y);
        this.text.setPosition(x, y);
    }

    pulseGreenBriefly(): void {
        this.pulseColor(0x00ff00);
    }

    pulseRedBriefly(): void {
        this.pulseColor(0xff0000);
    }

    private pulseColor(color: number): void {
        if (!this.background) return;

        const originalColor = this.background instanceof Phaser.GameObjects.Rectangle ? this.background.fillColor : 0xffffff;
        
        this.scene.tweens.add({
            targets: this.background,
            fillColor: { from: originalColor, to: color },
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                if (this.background instanceof Phaser.GameObjects.Rectangle) {
                    this.background.setFillStyle(originalColor);
                }
            }
        });
    }

    setSize(width: number, height: number): void {
        if (this.background === null) return;
        if (this.background instanceof Phaser.GameObjects.Rectangle) {
            this.background.setSize(width, height);
            this.background.setStrokeStyle(2, 0xffffff); // Reapply border if needed
        } else {
            this.background.setDisplaySize(width, height);
        }
        this.text.setWordWrapWidth(width - 20);
    }

    setText(text: string): void {
        if (this.text.scene === null) {
            return;
        }
        if (this.background == null){
            return;
        }
        if ((this.text.frame as any)?.data) {
            this.text.setText(text);
        } else{
            console.log("text frame data is null for " + this.textBoxName);
        }
    }

    setVisible(visible: boolean): void {
        if (this.background === null) {
            return;
        }
        this.background.setVisible(visible);
        this.text.setVisible(visible);
    }

    destroy(): void {
        if (this.background) {
            this.background.destroy();
        }
        this.text.destroy();
        this.background = null;
    }

    // Add this method to the TextBox class
    setScrollFactor(factor: number): void {
        if (this.background) {
            this.background.setScrollFactor(factor);
        }
        this.text.setScrollFactor(factor);
    }
}
