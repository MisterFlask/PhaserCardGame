// src/ui/TextBox.ts
import Phaser from 'phaser';

export class TextBox {
    background: Phaser.GameObjects.Rectangle | null;
    backgroundImage: Phaser.GameObjects.Image | null;
    text: Phaser.GameObjects.Text;
    outline: Phaser.GameObjects.Rectangle | null = null;
    textBoxName?: string;
    scene: Phaser.Scene;
    expandDirection: 'up' | 'down';

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
        this.textBoxName = textBoxName ?? "anonymousTextBox";
        this.scene = scene;
        this.expandDirection = params.expandDirection ?? 'down';
        // Create background with rounded corners if no image is provided
        if (backgroundImage) {
            this.backgroundImage = scene.add.image(x, y, backgroundImage).setDisplaySize(width, height).setOrigin(0.5);
            this.background = null;
        } else {
            this.background = scene.add.rectangle(x, y, width, height, fillColor).setOrigin(0.5);
            this.background.setStrokeStyle(2, 0xffffff); // Adding a border for better visibility
            this.backgroundImage = null;
        }

        // Create text with shadow for better readability
        this.text = scene.add.text(x, y, text, {
            ...style,
            color: '#ffffff', // Explicitly set color to white
            stroke: '#000000', // Change stroke to black for better contrast
            strokeThickness: 2,
            resolution: 1, // Add this line to improve text sharpness
            // Shadows are set separately
        });
        this.text.setOrigin(0.5);
        this.text.setWordWrapWidth(width - 20);
        this.text.setAlign('center');
        this.text.setShadow(2, 2, '#000000', 2, false, true); // offsetX, offsetY, color, blur, shadowStroke, shadowFill

        // Expand the text box if text overflows
        const padding = 10;
        let newWidth = Math.max(width, this.text.width + padding * 2);
        let newHeight = Math.max(height, this.text.height + padding * 2);

        // Expand downward and to each side
        if (newWidth > width || newHeight > height) {
            const widthIncrease = newWidth - width;
            const heightIncrease = newHeight - height;
            
            if (this.background) {
                this.background.setSize(newWidth, newHeight);
                this.background.setPosition(
                    this.background.x - widthIncrease / 2,
                    this.background.y + (this.expandDirection === 'down' ? heightIncrease / 2 : 0)
                );
            }
            
            if (this.backgroundImage) {
                this.backgroundImage.setDisplaySize(newWidth, newHeight);
                this.backgroundImage.setPosition(
                    this.backgroundImage.x - widthIncrease / 2,
                    this.backgroundImage.y + (this.expandDirection === 'down' ? heightIncrease / 2 : 0)
                );
            }
            
            this.text.setPosition(
                this.text.x - widthIncrease / 2,
                this.text.y + (this.expandDirection === 'down' ? heightIncrease / 2 : 0)
            );
            
            this.text.setWordWrapWidth(newWidth - padding * 2);
        }
    }

    setPosition(x: number, y: number): void {
        if (this.background) {
            this.background.setPosition(x, y);
        }
        if (this.backgroundImage) {
            this.backgroundImage.setPosition(x, y);
        }
        this.text.setPosition(x, y);
    }

    pulseGreenBriefly(): void {
        this.pulseColor(0x00ff00);
    }

    pulseRedBriefly(): void {
        this.pulseColor(0xff0000);
    }

    private pulseColor(color: number): void {
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

    setSize(width: number, height: number): void {
        if (this.background) {
            this.background.setSize(width, height);
            this.background.setStrokeStyle(2, 0xffffff); // Reapply border if needed
        }
        if (this.backgroundImage) {
            this.backgroundImage.setDisplaySize(width, height);
        }
        this.text.setWordWrapWidth(width - 20);
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
        if (this.background) {
            const padding = 10;
            const maxWidth = this.background.width;
            const maxHeight = this.background.height;

            if (this.text.height > maxHeight - padding) {
                const newHeight = this.text.height + padding;
                this.setSize(maxWidth, newHeight);

                if (this.expandDirection === 'up') {
                    const newY = this.background.y - (newHeight - maxHeight) / 2;
                    this.setPosition(this.background.x, newY);
                }
            }
        }
    }

    setInteractive(interactive: boolean): void {
        if (this.background) {
            this.background.setInteractive(interactive ? { useHandCursor: true } : undefined);
        }
        if (this.backgroundImage) {
            //this.backgroundImage.setInteractive(interactive ? { useHandCursor: true } : undefined);
        }
        this.text.setInteractive(interactive ? { useHandCursor: true } : undefined);
    }
    
    setVisible(visible: boolean): void {
        if (this.background) {
            this.background.setVisible(visible);
        }
        if (this.backgroundImage) {
            this.backgroundImage.setVisible(visible);
        }
        this.text.setVisible(visible);
    }

    destroy(): void {
        if (this.background) {
            this.background.destroy();
        }
        if (this.backgroundImage) {
            this.backgroundImage.destroy();
        }
        this.text.destroy();
        this.background = null;
        this.backgroundImage = null;
    }

    // Add this method to the TextBox class
    setScrollFactor(factor: number): void {
        if (this.background) {
            this.background.setScrollFactor(factor);
        }
        if (this.backgroundImage) {
            this.backgroundImage.setScrollFactor(factor);
        }
        this.text.setScrollFactor(factor);
    }

    setDepth(depth: number): void {
        if (this.background) {
            this.background.setDepth(depth);
        }
        if (this.backgroundImage) {
            this.backgroundImage.setDepth(depth);
        }
        this.text.setDepth(depth);
    }
}
