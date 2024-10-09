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
    iconKey?: string; // Key for the icon image
    callback: () => void;
}

export default class Menu {
    private scene: Phaser.Scene;
    public container: Phaser.GameObjects.Container;
    private background: Phaser.GameObjects.Rectangle;
    private options: MenuOption[];
    private optionContainers: Phaser.GameObjects.Container[] = [];
    private buttonSpacing: number = 60;

    constructor(config: MenuConfig) {
        this.scene = config.scene;
        this.options = config.options;

        // Create a container for the menu
        this.container = this.scene.add.container(config.x, config.y);

        // Add a semi-transparent background with rounded corners
        this.background = this.scene.add.rectangle(0, 0, config.width, config.height, 0x000000, 0.8)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xffffff);
        this.container.add(this.background);

        // Add the "Deck Contents" option
        this.options.push({
            text: 'Deck Contents',
            callback: () => this.showDeckContents()
        });

        // Create menu options with icons
        this.createOptions();

        // Initially hide the menu
        this.container.setVisible(false);
        this.container.setAlpha(0);
    }

    public updatePosition(x: number, y: number): void {
        this.container.setPosition(x, y);
    }

    /**
     * Creates the menu options as interactive containers with icons and text.
     */
    private createOptions(): void {
        this.options.forEach((option, index) => {
            // Create a container for each option
            const optionContainer = this.scene.add.container(0, (index - this.options.length / 2) * this.buttonSpacing);

            // Add icon
            const icon = this.scene.add.image(-100, 0, option.iconKey ?? "NO_ICON")
                .setDisplaySize(40, 40); // Adjust icon size as needed
            optionContainer.add(icon);

            // Add text
            const optionText = this.scene.add.text(0, 0, option.text, {
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 10, y: 10 },
                align: 'left'
            })
                .setOrigin(0, 0.5);
            optionContainer.add(optionText);

            // Set interactive area
            optionContainer.setSize(200, 50);
            optionContainer.setInteractive({ useHandCursor: true })
                .on('pointerover', () => this.onHover(optionContainer))
                .on('pointerout', () => this.onHoverOut(optionContainer))
                .on('pointerdown', () => option.callback());

            // Add hover animations
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
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 200,
                    ease: 'Power2'
                });
            });

            this.container.add(optionContainer);
            this.optionContainers.push(optionContainer);
        });
    }

    /**
     * Handles hover effect when the mouse is over a menu option.
     * @param container - The container being hovered.
     */
    private onHover(container: Phaser.GameObjects.Container): void {
        // Check if hover background already exists to prevent stacking
        let background = container.getByName('hoverBackground') as Phaser.GameObjects.Rectangle;
        if (!background) {
            background = this.scene.add.rectangle(0, 0, 200, 50, 0x555555, 0.5)
                .setOrigin(0.5)
                .setName('hoverBackground'); // Assign a name for easy retrieval
            container.addAt(background, 0); // Add background at the bottom
        }
    }

    /**
     * Removes hover effect when the mouse is out of a menu option.
     * @param container - The container being hovered out.
     */
    private onHoverOut(container: Phaser.GameObjects.Container): void {
        const background = container.getByName('hoverBackground');
        if (background) {
            background.destroy();
        }
    }

    /**
     * Toggles the visibility of the menu with a fade transition.
     */
    public toggle(): void {
        if (this.container.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Shows the menu with a fade-in transition.
     */
    public show(): void {
        this.container.setVisible(true);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }

    /**
     * Hides the menu with a fade-out transition.
     */
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

    /**
     * Shows the deck contents in a modal window.
     */
    private showDeckContents(): void {
        const gameState = GameState.getInstance();
        const deckContents = {
            drawPile: gameState.combatState.currentDrawPile.map(card => card.createJsonRepresentation()),
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
}