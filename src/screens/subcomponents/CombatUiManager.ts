// src/subcomponents/CombatUIManager.ts

import Phaser from 'phaser';
import { CombatRules } from '../../rules/CombatRules';
import { GameState } from '../../rules/GameState';
import { default as CombatSceneLayoutUtils, default as LayoutUtils } from '../../ui/LayoutUtils';
import Menu from '../../ui/Menu';
import { TextBox } from '../../ui/TextBox';

interface MenuOption {
    text: string;
    callback: () => void;
}

class CombatUIManager {
    private scene: Phaser.Scene;
    public menu!: Menu;
    public combatStatusText!: TextBox;
    public endTurnButton!: TextBox;
    public battlefieldArea!: Phaser.GameObjects.Rectangle;
    public handArea!: Phaser.GameObjects.Rectangle;
    public energyDisplay!: TextBox;
    public resourceIndicators: Phaser.GameObjects.Container[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createMenu();
        this.createCombatStatusText();
        this.createEndTurnButton();
        this.createGameAreas();
        this.createEnergyDisplay();
        this.createResourceIndicators(); // Add this line
    }

    private createEnergyDisplay(): void {
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        const pileY = CombatSceneLayoutUtils.getPileY(this.scene);

        this.energyDisplay = new TextBox({
            scene: this.scene,
            x: 100,  // Positioned toward the left
            y: pileY,  // Same Y as the draw pile
            width: 100,
            height: 40,
            text: this.getEnergyText(),
            style: {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: 'Arial'
            },
            fillColor: 0x0000ff,  // Blue background
            textBoxName: 'EnergyDisplay'
        });

        // Update the energy display whenever the game state changes
        this.scene.events.on('update', this.updateEnergyDisplay, this);
    }

    private getEnergyText(): string {
        const gameState = GameState.getInstance();
        return `${gameState.combatState.energyAvailable}/${gameState.combatState.maxEnergy}`;
    }

    private updateEnergyDisplay(): void {
        if (this.energyDisplay.text.text !== this.getEnergyText()){
            this.energyDisplay.pulseGreenBriefly();
            this.energyDisplay.setText(this.getEnergyText());
        }
    }

    private createMenu(): void {
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;

        const menuOptions: MenuOption[] = [
            {
                text: 'Start New Game',
                callback: () => {
                    GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
                    this.scene.scene.restart();
                }
            },
            {
                text: 'New Campaign',
                
                callback: () => {
                    this.scene.scene.start('Campaign');
                    GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
                }
            },
            {
                text: 'Quit',
                callback: () => {
                    this.scene.game.destroy(true);
                    GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
                }
            },
            {
                text: 'Toggle Game Areas',
                callback: () => this.toggleGameAreas()
            }
        ];

        const menuHeight = menuOptions.length * 60 + 100;

        this.menu = new Menu({
            scene: this.scene,
            x: gameWidth - 250,
            y: gameHeight / 2,
            width: 300,
            height: menuHeight,
            options: menuOptions
        });

        const menuButton = this.scene.add.text(gameWidth - 350, 50, '☰ Menu', {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 10 },
            align: 'center',
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.menu.toggle())
            .on('pointerover', () => {
                this.scene.tweens.add({
                    targets: menuButton,
                    scale: 1.1,
                    duration: 200,
                    ease: 'Power2'
                });
                menuButton.setStyle({ backgroundColor: '#555555' });
            })
            .on('pointerout', () => {
                this.scene.tweens.add({
                    targets: menuButton,
                    scale: 1.0,
                    duration: 200,
                    ease: 'Power2'
                });
                menuButton.setStyle({ backgroundColor: '#000000' });
            })
            .setName('MenuButton');

        this.scene.add.existing(menuButton);
    }

    private toggleGameAreas(): void {
        this.battlefieldArea.setVisible(!this.battlefieldArea.visible);
        this.handArea.setVisible(!this.handArea.visible);
    }

    private createCombatStatusText(): void {
        const gameWidth = this.scene.scale.width;
        const pileY = CombatSceneLayoutUtils.getPileY(this.scene);

        this.combatStatusText = new TextBox({
            scene: this.scene,
            x: gameWidth * 0.5,
            y: pileY,
            width: 300,
            height: 50,
            text: 'CURRENT COMBAT STATUS',
            style: { fontSize: '24px', color: '#000', align: 'center' }
        });
    }

    private createEndTurnButton(): void {
        const gameWidth = this.scene.scale.width;
        const pileY = CombatSceneLayoutUtils.getPileY(this.scene);

        this.endTurnButton = new TextBox({
            scene: this.scene,
            x: gameWidth * 0.7,
            y: pileY,
            width: 120,
            height: 40,
            text: 'End Turn',
            style: {
                fontSize: '24px',
                color: '#ffffff'
            },
            backgroundImage: 'button_background'
        });

        this.endTurnButton.background!!.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                CombatRules.endTurn();
            });

        this.scene.add.existing(this.endTurnButton.background!!);
        this.scene.add.existing(this.endTurnButton.text);
    }

    public updateLayout(width: number, height: number): void {
        // Update positions based on new width and height
        this.menu.updatePosition(width * 0.25, height / 2);
        this.combatStatusText.setPosition(width * 0.5, CombatSceneLayoutUtils.getPileY(this.scene));
        this.endTurnButton.setPosition(width * 0.7, CombatSceneLayoutUtils.getPileY(this.scene));

        const menuButton = this.scene.children.getByName('MenuButton') as Phaser.GameObjects.Text;
        if (menuButton) {
            menuButton.setPosition(width * 0.25, 50);
        }

        // Update game areas
        this.updateGameAreas();

        // Update energy display position
        const pileY = CombatSceneLayoutUtils.getPileY(this.scene);
        this.energyDisplay.setPosition(100, pileY);
    }
    
    private createGameAreas(): void {
        const gameWidth = this.scene.scale.width;
        const handY = LayoutUtils.getHandY(this.scene);
        const battlefieldY = LayoutUtils.getBattlefieldY(this.scene);

        // Battlefield Area
        this.battlefieldArea = this.scene.add.rectangle(gameWidth / 2, battlefieldY, gameWidth - 100, 300)
            .setStrokeStyle(4, 0xffff00)
            .setFillStyle(0xffff00, 0.2) // Added fill for visibility
            // .setInteractive() // Removed to prevent blocking underlying events
            .setVisible(false); // Ensure visible during testing

        // Hand Area
        this.handArea = this.scene.add.rectangle(gameWidth / 2, handY, gameWidth - 100, 300)
            .setStrokeStyle(4, 0x00ff00)
            .setFillStyle(0x00ff00, 0.2) // Added fill for visibility
            // .setInteractive() // Removed to prevent blocking underlying events
            .setVisible(false); // Ensure visible during testing

        // Ensure these areas are on top of other game objects
        this.battlefieldArea.setDepth(1000);
        this.handArea.setDepth(1000);

        // Setup global pointer events
        this.setupGlobalPointerEvents();
    }

    private setupGlobalPointerEvents(): void {
        this.scene.input.on('pointermove', this.handlePointerMove, this);
    }

    private handlePointerMove(pointer: Phaser.Input.Pointer): void {
        // Check if pointer is over the battlefield area
        const isOverBattlefield = this.battlefieldArea.getBounds().contains(pointer.x, pointer.y);
        if (isOverBattlefield) {
            // Trigger desired action when hovering over battlefield
            console.log('Pointer is over the Battlefield Area');
            // Example: Highlight battlefield or show specific UI elements
        }

        // Check if pointer is over the hand area
        const isOverHand = this.handArea.getBounds().contains(pointer.x, pointer.y);
        if (isOverHand) {
            // Trigger desired action when hovering over hand
            console.log('Pointer is over the Hand Area');
            // Example: Highlight hand area or show specific UI elements
        }
    }

    private updateGameAreas(): void {
        const gameWidth = this.scene.scale.width;
        const handY = LayoutUtils.getHandY(this.scene);
        const battlefieldY = LayoutUtils.getBattlefieldY(this.scene);

        this.battlefieldArea.setPosition(gameWidth / 2, battlefieldY).setSize(gameWidth - 100, 300);
        this.handArea.setPosition(gameWidth / 2, handY).setSize(gameWidth - 100, 300);
    }

    private removeEventListeners(): void {
        // ... existing removals ...

        // Remove global pointer events
        this.scene.input.off('pointermove', this.handlePointerMove, this);
    }
    private createResourceIndicators(): void {
        const resources = GameState.getInstance().combatState.combatResources;
        const resourceArray = [
            resources.light,
            resources.fire,
            resources.iron,
            resources.mind,
            resources.ice,
            resources.gold,
            resources.muscle
        ];

        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        const startX = gameWidth - 150;
        const startY = gameHeight - 350;
        const spacingY = 50;

        resourceArray.forEach((resource, index) => {
            const icon = this.scene.add.image(startX, startY + index * spacingY, resource.icon).setDisplaySize(32, 32);
            const text = this.scene.add.text(startX + 40, startY + index * spacingY, `${resource.name}: ${resource.value}`, {
                fontSize: '20px',
                color: '#ffffff',
                fontFamily: 'Arial'
            });
            text.setShadow(2, 2, '#000000', 2, true, true); // Add drop shadow

            const container = this.scene.add.container(0, 0, [icon, text]);
            this.resourceIndicators.push(container);
        });

        this.scene.events.on('update', this.updateResourceIndicators, this);
    }

    private updateResourceIndicators(): void {
        const resources = GameState.getInstance().combatState.combatResources;
        const resourceArray = [
            resources.light,
            resources.fire,
            resources.iron,
            resources.mind,
            resources.ice,
            resources.gold,
            resources.muscle
        ];
        this.resourceIndicators.forEach((container, index) => {
            const resource = resourceArray[index];
            const text = container.getAt(1) as Phaser.GameObjects.Text;
            text.setText(`${resource.name}: ${resource.value}`);
        });
    }
}

export default CombatUIManager;
