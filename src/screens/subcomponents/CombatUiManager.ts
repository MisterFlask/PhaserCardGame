// src/subcomponents/CombatUIManager.ts

import Phaser from 'phaser';
import { IAbstractCard } from '../../gamecharacters/IAbstractCard';
import { Defend } from '../../gamecharacters/playerclasses/cards/basic/Defend';
import { GameState } from '../../rules/GameState';
import { TextBoxButton } from '../../ui/Button';
import { default as CombatSceneLayoutUtils, default as LayoutUtils } from '../../ui/LayoutUtils';
import Menu from '../../ui/Menu';
import { SubtitleManager } from '../../ui/SubtitleManager';
import { TextBox } from '../../ui/TextBox';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { ActionManager } from '../../utils/ActionManager';
import CardRewardScreen, { CardReward } from './CardRewardScreen';

interface MenuOption {
    text: string;
    callback: () => void;
}

class CombatUIManager {
    private static instance: CombatUIManager;
    public scene: Phaser.Scene;
    public menu!: Menu;
    public combatStatusText!: TextBox;
    public endTurnButton!: TextBoxButton;
    public battlefieldArea!: Phaser.GameObjects.Rectangle;
    public handArea!: Phaser.GameObjects.Rectangle;
    public energyDisplay!: TextBox;
    public resourceIndicators: Phaser.GameObjects.Container[] = [];
    private subtitleTextBox?: TextBox;
    private cardRewardScreen!: CardRewardScreen;
    private combatEnded: boolean = false;

    private constructor(scene: Phaser.Scene) {
        this.scene = scene;
        SubtitleManager.setInstance(scene);
        this.createUI();
        this.createCardRewardScreen();

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
        this.createCombatStatusText();
        this.createEndTurnButton();
        this.createGameAreas();
        this.createEnergyDisplay();
        this.createResourceIndicators();
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

        this.scene.add.existing(this.combatStatusText);
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
            ActionManager.getInstance().endTurn();
        });

        this.scene.add.existing(this.endTurnButton);
    }

    public updateLayout(width: number, height: number): void {
        this.menu.updatePosition(width * 0.25, height / 2);
        this.combatStatusText.setPosition(width * 0.5, CombatSceneLayoutUtils.getPileY(this.scene));
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
        this.resourceIndicators.forEach(container => container.destroy());
        this.resourceIndicators = [];
        this.scene.events.off('update', this.updateResourceIndicators, this);
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
            const icon = this.scene.add.image(startX, startY + index * spacingY, resource.icon)
                .setDisplaySize(64, 64)
                .setInteractive();

            const text = this.scene.add.text(startX + 40, startY + index * spacingY, `${resource.name}: ${resource.value}`, {
                fontSize: '20px',
                color: '#ffffff',
                fontFamily: 'Arial'
            });
            text.setShadow(2, 2, '#000000', 2, true, true);

            const container = this.scene.add.container(0, 0, [icon, text]);
            this.resourceIndicators.push(container);

            // Create tooltip using the resource's description
            const tooltip = new TextBox({
                scene: this.scene,
                x: startX - 250,
                y: startY + index * spacingY,
                width: 230,
                height: 100,
                text: resource.description,
                style: { 
                    fontSize: '16px', 
                    color: '#ffffff', 
                    wordWrap: { width: 220 } 
                },
                fillColor: 0x000000
            });
            tooltip.setVisible(false);

            // Add click handler
            icon.on('pointerdown', () => {
                if (UIContextManager.getInstance().getContext() === UIContext.COMBAT) {
                    resource.onClick();
                }
            });

            icon.on('pointerover', () => {
                tooltip.setVisible(true);
                icon.setTint(0xcccccc); // Slight darkening to indicate hover
            });

            icon.on('pointerout', () => {
                tooltip.setVisible(false);
                icon.clearTint();
            });

            this.scene.add.existing(tooltip);
        });

        this.scene.events.on('update', this.updateResourceIndicators, this);
    }

    private updateResourceIndicators(): void {
        const resources = GameState.getInstance().combatState.combatResources;
        const resourceArray = [
            resources.powder,
            resources.iron,
            resources.pages,
            resources.pluck,
            resources.venture,
            resources.smog
        ];
        this.resourceIndicators.forEach((container, index) => {
            const resource = resourceArray[index];
            const text = container.getAt(1) as Phaser.GameObjects.Text;
            text.setText(`${resource.name}: ${resource.value}`);
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
                expandDirection: 'down'
            });
            this.subtitleTextBox.setDepth(100);
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

    private createCardRewardScreen(): void {
        this.cardRewardScreen = new CardRewardScreen({
            scene: this.scene,
            rewards: [],
            onSelect: this.handleCardSelect.bind(this),
            onSkip: this.handleSkip.bind(this)
        });
        this.cardRewardScreen.container.setDepth(1001);
        this.cardRewardScreen.container.setScrollFactor(0);
        this.cardRewardScreen.hide();
    }

    public onCombatEnd(): void {
        if (this.combatEnded) return;
        this.combatEnded = true;

        const rewardCards = this.determineCardRewards();
        this.cardRewardScreen.rewards = rewardCards;
        this.cardRewardScreen.displayRewardCards();
        this.cardRewardScreen.show();
        UIContextManager.getInstance().setContext(UIContext.CARD_REWARD);
    }

    private determineCardRewards(): CardReward[] {
        const characters = GameState.getInstance().getCurrentRunCharacters()
        const rewards= []
        for (const character of characters){
            rewards.push(new CardReward(new Defend(), character))
        }
        return rewards
    }

    private handleCardSelect(selectedCard: CardReward): void {
        console.log("Card selected:", selectedCard.card.name);
    }

    private handleSkip(): void {
        console.log("Skip selected.");
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
}

export default CombatUIManager;
