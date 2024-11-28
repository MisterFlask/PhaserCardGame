// src/subcomponents/CombatUIManager.ts

import Phaser from 'phaser';
import { IAbstractCard } from '../../gamecharacters/IAbstractCard';
import { AbstractReward } from '../../rewards/AbstractReward';
import { CardReward } from '../../rewards/CardReward';
import { CurrencyReward } from '../../rewards/CurrencyReward';
import { CardRewardsGenerator } from '../../rules/CardRewardsGenerator';
import { GameState } from '../../rules/GameState';
import { TextBoxButton } from '../../ui/Button';
import { CombatResourceDisplay } from '../../ui/CombatResourceDisplay';
import { DebugMenu } from '../../ui/DebugMenu';
import { DepthManager } from '../../ui/DepthManager';
import { default as CombatSceneLayoutUtils, default as LayoutUtils } from '../../ui/LayoutUtils';
import Menu from '../../ui/Menu';
import { SubtitleManager } from '../../ui/SubtitleManager';
import { TextBox } from '../../ui/TextBox';
import { TransientUiState } from '../../ui/TransientUiState';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { ActionManager } from '../../utils/ActionManager';
import GeneralRewardScreen from './GeneralRewardScreen';

interface MenuOption {
    text: string;
    callback: () => void;
}

class CombatUIManager {
    private static instance: CombatUIManager;
    public scene: Phaser.Scene;
    public menu!: Menu;
    public endTurnButton!: TextBoxButton;
    public battlefieldArea!: Phaser.GameObjects.Rectangle;
    public handArea!: Phaser.GameObjects.Rectangle;
    public energyDisplay!: TextBox;
    public resourceIndicators: CombatResourceDisplay[] = [];
    private subtitleTextBox?: TextBox;
    private generalRewardScreen!: GeneralRewardScreen;
    private combatEnded: boolean = false;
    private debugOverlay!: TextBox;
    public dropZoneHighlight!: Phaser.GameObjects.Image;
    private debugMenu!: DebugMenu;

    private constructor(scene: Phaser.Scene) {
        this.scene = scene;
        SubtitleManager.setInstance(scene);
        this.createUI();

        this.scene.events.on('disableInteractions', this.disableInteractions, this);
        this.scene.events.on('enableInteractions', this.enableInteractions, this);

        this.scene.events.once('shutdown', this.obliterate, this);
        this.scene.events.once('destroy', this.obliterate, this);
    }

    public static getInstance(): CombatUIManager {
        if (!CombatUIManager.instance) {
            throw new Error('CombatUIManager not initialized');
        }
        return CombatUIManager.instance;
    }

    public static initialize(scene: Phaser.Scene): void {
        CombatUIManager.instance?.obliterate()
        CombatUIManager.instance = new CombatUIManager(scene);
    }

    private createUI(): void {
        this.createMenu();
        this.createEndTurnButton();
        this.createGameAreas();
        this.createEnergyDisplay();
        this.createResourceIndicators();
        this.createDebugOverlay();
        this.setupDebugOverlayToggle();
        this.createDebugMenu();
        
        this.setScrollFactorForAllElements();
    }

    private setScrollFactorForAllElements(): void {
        this.menu.container.setScrollFactor(0);
        this.endTurnButton.setScrollFactor(0);

        this.battlefieldArea.setScrollFactor(0);
        this.handArea.setScrollFactor(0);
        this.dropZoneHighlight.setScrollFactor(0);

        this.energyDisplay.setScrollFactor(0);

        this.resourceIndicators.forEach(indicator => {
            indicator.setScrollFactor(0);
        });

        this.debugOverlay.setScrollFactor(0);

        if (this.subtitleTextBox) {
            this.subtitleTextBox.setScrollFactor(0);
        }
    }

    private createEnergyDisplay(): void {
        const pileY = CombatSceneLayoutUtils.getPileY(this.scene);

        this.energyDisplay = new TextBox({
            scene: this.scene,
            x: 100,
            y: pileY,
            width: 100,
            height: 40,
            text: this.getEnergyText(),
            style: {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: 'Arial'
            },
            fillColor: 0x0000ff,
            textBoxName: 'EnergyDisplay'
        });

        this.scene.add.existing(this.energyDisplay);
        this.scene.events.on('update', this.updateEnergyDisplay, this);
    }

    private getEnergyText(): string {
        const gameState = GameState.getInstance();
        return `${gameState.combatState.energyAvailable}/${gameState.combatState.maxEnergy}`;
    }

    private updateEnergyDisplay(): void {
        if (this.energyDisplay.getText() !== this.getEnergyText()){
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
            },
            {
                text: 'debug:killAllEnemies',
                callback: () => {
                    const gameState = GameState.getInstance();
                    gameState.combatState.enemies.forEach(enemy => {
                        enemy.hitpoints = 0;
                    });
                    console.log("All enemies defeated for debugging purposes.");
                    this.onCombatEnd();
                }
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

        const menuButton = new TextBoxButton({
            scene: this.scene,
            x: gameWidth - 350,
            y: 50,
            width: 120,
            height: 40,
            text: '☰ Menu',
            style: {
                fontSize: '28px',
                color: '#ffffff',
            },
            fillColor: 0x000000,
            textBoxName: 'MenuButton'
        }).setZoomScales(1.0, 1.1);

        menuButton
            .onClick(() => this.menu.toggle());

        menuButton.setScrollFactor(0);
        this.scene.add.existing(menuButton);
    }

    private toggleGameAreas(): void {
        this.battlefieldArea.setVisible(!this.battlefieldArea.visible);
        this.handArea.setVisible(!this.handArea.visible);
    }


    private createEndTurnButton(): void {
        const gameWidth = this.scene.scale.width;
        const pileY = CombatSceneLayoutUtils.getPileY(this.scene);

        this.endTurnButton = new TextBoxButton({
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
            backgroundImage: 'button_background',
            textBoxName: 'EndTurnButton'
        });

        this.endTurnButton.onClick(() => {
            if (UIContextManager.getInstance().getContext() === UIContext.COMBAT_BUT_NOT_YOUR_TURN) return;
            ActionManager.getInstance().endTurn();
        });

        this.scene.add.existing(this.endTurnButton);
    }

    public updateLayout(width: number, height: number): void {
        this.menu.updatePosition(width * 0.25, height / 2);
        this.endTurnButton.setPosition(width * 0.7, CombatSceneLayoutUtils.getPileY(this.scene));

        const menuButton = this.scene.children.getByName('MenuButton') as TextBoxButton;
        if (menuButton) {
            menuButton.setPosition(width * 0.25, 50);
        }

        this.updateGameAreas();

        const pileY = CombatSceneLayoutUtils.getPileY(this.scene);
        this.energyDisplay.setPosition(100, pileY);
    }
    
    private createGameAreas(): void {
        const gameWidth = this.scene.scale.width;
        const handY = LayoutUtils.getHandY(this.scene);
        const battlefieldY = LayoutUtils.getBattlefieldY(this.scene);

        // Create battlefield highlight
        const dropArea = CombatSceneLayoutUtils.getBattlefieldDropArea(this.scene);
        this.dropZoneHighlight = this.scene.add.image(
            dropArea.x + dropArea.width / 2,
            dropArea.y + dropArea.height / 2,
            'cheap_glow_effect'
        );
        this.dropZoneHighlight.setDisplaySize(dropArea.width, dropArea.height);

        this.dropZoneHighlight.setInteractive()
        .on('pointerover', () => {
            TransientUiState.getInstance().mouseOverCardDropZone = true;
        }).on('pointerout', () => {
            TransientUiState.getInstance().mouseOverCardDropZone = false;
        });
        this.dropZoneHighlight.setAlpha(0.4);
        this.dropZoneHighlight.setDepth(DepthManager.getInstance().BATTLEFIELD_HIGHLIGHT);

        this.battlefieldArea = this.scene.add.rectangle(gameWidth / 2, battlefieldY, gameWidth - 100, 300)
            .setStrokeStyle(4, 0xffff00)
            .setFillStyle(0xffff00, 0.2)
            .setVisible(false);

        this.handArea = this.scene.add.rectangle(gameWidth / 2, handY, gameWidth - 100, 300)
            .setStrokeStyle(4, 0x00ff00)
            .setFillStyle(0x00ff00, 0.2)
            .setVisible(false);

        this.battlefieldArea.setDepth(1000);
        this.handArea.setDepth(1000);

        this.setupGlobalPointerEvents();
    }

    private setupGlobalPointerEvents(): void {
        this.scene.input.on('pointermove', this.handlePointerMove, this);
    }

    private handlePointerMove(pointer: Phaser.Input.Pointer): void {
        const isOverBattlefield = this.battlefieldArea.getBounds().contains(pointer.x, pointer.y);
        if (isOverBattlefield) {
            console.log('Pointer is over the Battlefield Area');
        }

        const isOverHand = this.handArea.getBounds().contains(pointer.x, pointer.y);
        if (isOverHand) {
            console.log('Pointer is over the Hand Area');
        }
    }

    private updateGameAreas(): void {
        const gameWidth = this.scene.scale.width;
        const handY = LayoutUtils.getHandY(this.scene);
        const battlefieldY = LayoutUtils.getBattlefieldY(this.scene);

        this.battlefieldArea.setPosition(gameWidth / 2, battlefieldY).setSize(gameWidth - 100, 300);
        this.handArea.setPosition(gameWidth / 2, handY).setSize(gameWidth - 100, 300);
    }

    private obliterate(): void {
        this.scene.input.off('pointermove', this.handlePointerMove, this);
        this.scene.events.off('disableInteractions', this.disableInteractions, this);
        this.scene.events.off('enableInteractions', this.enableInteractions, this);
        this.resourceIndicators.forEach(display => display.destroy());
        this.resourceIndicators = [];
        this.scene.events.off('update', this.updateResourceIndicators, this);
        this.scene.events.off('update', this.updateEnergyDisplay, this);

        this.scene.events.off('update', () => {
            if (this.debugOverlay.visible) {
                this.updateDebugOverlay();
            }
        });
        if (this.dropZoneHighlight) {
            this.dropZoneHighlight.destroy();
        }
        if (this.debugMenu) {
            this.debugMenu.destroy();
        }
    }

    private createResourceIndicators(): void {
        const resources = GameState.getInstance().combatState.combatResources;
        const resourceArray = resources.resources();

        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        const startX = gameWidth - 150;
        const startY = gameHeight - 350;
        const spacingY = 50;

        resourceArray.forEach((resource, index) => {
            const resourceDisplay = new CombatResourceDisplay(
                this.scene,
                startX,
                startY + index * spacingY,
                resource
            );
            this.resourceIndicators.push(resourceDisplay);
        });

        this.scene.events.on('update', this.updateResourceIndicators, this);
    }

    private updateResourceIndicators(): void {
        this.resourceIndicators.forEach((display) => {
            (display as CombatResourceDisplay).updateValue();
        });
    }

    public async showSubtitle(text: string): Promise<void> {
        if (!this.subtitleTextBox) {
            this.subtitleTextBox = new TextBox({
                scene: this.scene,
                x: this.scene.scale.width / 2,
                y: 50,
                width: 400,
                height: 50,
                text: text,
                style: { fontSize: '24px', color: '#ffffff' },
                verticalExpand: 'down',
                horizontalExpand: 'right'
            });
            this.subtitleTextBox.setDepth(100);
            this.subtitleTextBox.setScrollFactor(0);
            this.scene.add.existing(this.subtitleTextBox);
        } else {
            this.subtitleTextBox.setText(text);
            this.subtitleTextBox.setVisible(true);
        }
    }

    public async hideSubtitle(): Promise<void> {
        if (this.subtitleTextBox) {
            this.subtitleTextBox.setVisible(false);
        }
    }

    public onCombatEnd(): void {
        if (this.combatEnded) return;
        this.combatEnded = true;

        const rewards = this.determineRewards();
        this.generalRewardScreen = new GeneralRewardScreen(this.scene, rewards);
        this.generalRewardScreen.show();
        UIContextManager.getInstance().setContext(UIContext.REWARD_SCREEN);
    }

    // TODO: Placeholder, not really appropriate for this class
    private determineRewards(): AbstractReward[] {
        const rewards: AbstractReward[] = [];

        // Generate card rewards
        const cardRewards = CardRewardsGenerator.getInstance()
            .generateCardRewardsForCombat();
        rewards.push(new CardReward(cardRewards));

        // Add hell currency reward
        rewards.push(new CurrencyReward(100));

        return rewards;
    }

    public disableInteractions(): void {
        this.endTurnButton.setButtonEnabled(false);
    }

    public enableInteractions(): void {
        this.endTurnButton.setButtonEnabled(true);
    }

    public getPlayerHandCards(): IAbstractCard[] {
        return GameState.getInstance().combatState.currentHand;
    }

    private createDebugOverlay(): void {
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        
        this.debugOverlay = new TextBox({
            scene: this.scene,
            x: gameWidth - 200,  // Position on right side
            y: gameHeight * 0.3, // Position in middle-right
            width: 300,          // Increased width for more info
            height: 200,         // Increased height for more info
            text: 'Debug Info',
            style: { 
                fontSize: '14px', 
                color: '#00ff00',
                align: 'left',
                wordWrap: { width: 280 } // Enable word wrap
            },
            fillColor: 0x000000,
            textBoxName: 'DebugOverlay'
        });
        
        // Set depth using DepthManager
        this.debugOverlay.setDepth(DepthManager.getInstance().OVERLAY_BASE + 500);
        this.debugOverlay.setVisible(false);
        this.scene.add.existing(this.debugOverlay);

    }

    private setupDebugOverlayToggle(): void {
        const ctrlKey = this.scene.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
        ctrlKey?.on('down', () => {
            this.toggleDebugOverlay();
        });

        this.scene.events.on('update', () => {
            if (this.debugOverlay.visible) {
                this.updateDebugOverlay();
            }
        });
    }

    private toggleDebugOverlay(): void {
        this.debugOverlay.setVisible(!this.debugOverlay.visible);
        if (this.debugOverlay.visible) {
            this.updateDebugOverlay();
        }
    }

    private updateDebugOverlay(): void {
        const gameState = GameState.getInstance();
        const transientState = TransientUiState.getInstance();
        
        // Get base debug info
        let debugText = transientState.getDebugDisplayString();
        
        // Add character highlight status
        debugText += '\n\nCharacter Highlights:';
        
        // Add player characters
        gameState.getCurrentRunCharacters().forEach(character => {
            if (character.physicalCard) {
                debugText += `\n${character.name}: ${character.physicalCard.isHighlighted ? '🌟 Glowing' : '⚪ Normal'}`;
            }
        });
        
        // Add enemies
        gameState.combatState.enemies.forEach(enemy => {
            if (enemy.physicalCard) {
                debugText += `\n${enemy.name}: ${enemy.physicalCard.isHighlighted ? '🌟 Glowing' : '⚪ Normal'}`;
            }
        });

        GameState.getInstance().combatState.currentHand.forEach(card => {
            debugText += `\n${card.name}: ${card.physicalCard?.isHighlighted ? '🌟 Glowing' : '⚪ Normal'}`;
        });
        
        this.debugOverlay.setText(debugText);
    }

    private createDebugMenu(): void {
        this.debugMenu = new DebugMenu(this.scene);
    }
}

export default CombatUIManager;

