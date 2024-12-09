// src/ui/Menu.ts

import Phaser from 'phaser';
import { GameState } from '../rules/GameState';

interface MenuConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    width: number;
    height: number;
    options: MenuOption[];
}

interface MenuOption {
    text: string;
    iconKey?: string;
    callback: () => void;
}

export default class Menu {
    private scene: Phaser.Scene;
    public container: Phaser.GameObjects.Container;
    private background: Phaser.GameObjects.Rectangle;
    private options: MenuOption[];
    private optionContainers: Phaser.GameObjects.Container[] = [];
    private buttonHeight: number = 50;
    private buttonSpacing: number = 60;

    constructor(config: MenuConfig) {
        this.scene = config.scene;
        this.options = config.options;

        this.container = this.scene.add.container(config.x, config.y);

        this.background = this.scene.add.rectangle(0, 0, config.width, config.height, 0x111111, 0.9)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xffffff);
        this.container.add(this.background);

        this.options.push({
            text: 'Deck Contents',
            callback: () => this.showDeckContents()
        });

        this.createOptions();

        this.container.setVisible(false);
        this.container.setAlpha(0);
        this.container.setScrollFactor(0);
    }

    public updatePosition(x: number, y: number): void {
        this.container.setPosition(x, y);
    }
    private createOptions(): void {
        let maxWidth = 0;
        const totalHeight = this.options.length * this.buttonSpacing;
        let startY = -(totalHeight - this.buttonSpacing) / 2;
    
        this.options.forEach((option) => {
            const optionContainer = this.scene.add.container(0, startY);
    
            const icon = this.scene.add.image(0,0, option.iconKey ?? "NO_ICON")
                .setDisplaySize(40, 40);
    
            const optionText = this.scene.add.text(0,0, option.text, {
                fontSize: '24px',
                color: '#ffffff'
            }).setOrigin(0.5);
    
            const totalWidth = icon.displayWidth + 10 + optionText.width;
            icon.setX(-totalWidth/2 + icon.displayWidth/2);
            optionText.setX(icon.x + icon.displayWidth/2 + 10 + optionText.width/2);
    
            optionContainer.add([icon, optionText]);
            optionContainer.setSize(totalWidth, 50);
            optionContainer.setInteractive({ useHandCursor: true })
                .on('pointerover', () => this.onHover(optionContainer))
                .on('pointerout', () => this.onHoverOut(optionContainer))
                .on('pointerdown', () => option.callback());
    
            optionContainer.on('pointerover', () => {
                this.scene.tweens.add({
                    targets: optionContainer,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 200,
                    ease: 'Power2'
                });
            });
    
            optionContainer.on('pointerout', () => {
                this.scene.tweens.add({
                    targets: optionContainer,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            });
    
            this.container.add(optionContainer);
            this.optionContainers.push(optionContainer);
    
            if (totalWidth > maxWidth) maxWidth = totalWidth;
            startY += this.buttonSpacing;
        });
    
        // pad the background a bit
        const padding = 40;
        const neededWidth = maxWidth + padding;
        const neededHeight = this.options.length * this.buttonSpacing;
        this.background.width = Math.max(this.background.width, neededWidth);
        this.background.height = Math.max(this.background.height, neededHeight + padding);
    }
    

    private onHover(container: Phaser.GameObjects.Container): void {
        let background = container.getByName('hoverBackground') as Phaser.GameObjects.Rectangle;
        if (!background) {
            background = this.scene.add.rectangle(0, 0, container.width, container.height, 0xffffff, 0.2)
                .setOrigin(0.5)
                .setName('hoverBackground');
            container.addAt(background, 0);
        }
    }

    private onHoverOut(container: Phaser.GameObjects.Container): void {
        const background = container.getByName('hoverBackground');
        if (background) {
            background.destroy();
        }
    }

    public toggle(): void {
        if (this.container.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    public show(): void {
        this.container.setVisible(true);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }

    public hide(): void {
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.container.setVisible(false);
            }
        });
    }

    private showDeckContents(): void {
        const gameState = GameState.getInstance();
        const deckContents = {
            drawPile: gameState.combatState.drawPile.map(card => card.createJsonRepresentation()),
            hand: gameState.combatState.currentHand.map(card => card.createJsonRepresentation()),
            discardPile: gameState.combatState.currentDiscardPile.map(card => card.createJsonRepresentation())
        };

        const modalBackground = this.scene.add.rectangle(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            this.scene.scale.width * 0.8,
            this.scene.scale.height * 0.8,
            0x000000,
            0.8
        ).setOrigin(0.5);

        const modalText = this.scene.add.text(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            JSON.stringify(deckContents, null, 2),
            {
                fontSize: '16px',
                color: '#ffffff',
                align: 'left',
                wordWrap: { width: modalBackground.width - 40 }
            }
        ).setOrigin(0.5);

        const closeButton = this.scene.add.text(
            modalBackground.x + modalBackground.width / 2 - 20,
            modalBackground.y - modalBackground.height / 2 + 20,
            'X',
            {
                fontSize: '24px',
                color: '#ffffff'
            }
        ).setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                modalBackground.destroy();
                modalText.destroy();
                closeButton.destroy();
            });
    }

    public updateOptions(newOptions: MenuOption[]): void {
        this.options = newOptions;
        this.optionContainers.forEach(container => container.destroy());
        this.optionContainers = [];
        this.createOptions();
    }

    public isVisible(): boolean {
        return this.container.visible;
    }

    public destroy(): void {
        this.container.destroy();
    }
}
