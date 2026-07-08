// src/subcomponents/CombatUIManager.ts

import Phaser from 'phaser';
import { SortieManager } from '../../campaign/SortieManager';
import { AbstractConsumable } from '../../consumables/AbstractConsumable';
import { AbstractEvent } from '../../events/AbstractEvent';
import { EventsManager } from '../../events/EventsManager';
import { IAbstractCard } from '../../gamecharacters/IAbstractCard';
import { AbstractReward } from '../../rewards/AbstractReward';
import { GameState } from '../../rules/GameState';
import { TextBoxButton } from '../../ui/Button';
import { CombatResourceDisplay } from '../../ui/CombatResourceDisplay';
import { DebugMenu } from '../../ui/DebugMenu';
import { DepthManager } from '../../ui/DepthManager';
import { EventWindow } from '../../ui/EventWindow';
import { default as CombatSceneLayoutUtils, default as LayoutUtils } from '../../ui/LayoutUtils';
import Menu from '../../ui/Menu';
import { PhysicalConsumable } from '../../ui/PhysicalConsumable';
import { SubtitleManager } from '../../ui/SubtitleManager';
import { TextBox } from '../../ui/TextBox';
import { TooltipAttachment } from '../../ui/TooltipAttachment';
import { TransientUiState } from '../../ui/TransientUiState';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { Fonts, Palette } from '../../ui/UIStyle';
import { ActionManager } from '../../utils/ActionManager';
import SoundUtils from '../../utils/SoundUtils';
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
    private energyTooltip?: TooltipAttachment;
    public resourceIndicators: CombatResourceDisplay[] = [];
    private subtitleTextBox?: TextBox;
    private generalRewardScreen!: GeneralRewardScreen;
    private combatEnded: boolean = false;
    private debugOverlay!: TextBox;
    public dropZoneHighlight!: Phaser.GameObjects.Image;
    private debugMenu!: DebugMenu;
    private eventWindow: EventWindow | null = null;
    
    // Consumables related properties
    public consumablesContainer!: Phaser.GameObjects.Container;
    public activeConsumables: PhysicalConsumable[] = [];
    public consumablesArea!: Phaser.GameObjects.Rectangle;

    private slotBoxesContainer!: Phaser.GameObjects.Container;
    private slotBoxRefs: Phaser.GameObjects.Rectangle[] = [];

    private constructor(scene: Phaser.Scene) {
        this.scene = scene;
        SubtitleManager.setInstance(scene);
        this.createUI();

        this.scene.events.on('disableInteractions', this.disableInteractions, this);
        this.scene.events.on('enableInteractions', this.enableInteractions, this);

        this.scene.events.once('shutdown', this.obliterate, this);
        this.scene.events.once('destroy', this.obliterate, this);
        this.scene.events.on('abstractEvent:launch', this.onAbstractEventLaunch, this);
        this.scene.events.on('consumable_depleted', this.onConsumableDepleted, this);
    }

    public onAbstractEventLaunch(event: AbstractEvent): void {
        this.showEvent(event);
    }

    private onConsumableDepleted(abstractConsumable: AbstractConsumable): void {
        this.loadConsumablesFromGameState();
    }

    public static getInstance(): CombatUIManager {
        if (!CombatUIManager.instance) {
            throw new Error('CombatUIManager not initialized');
        }
        return CombatUIManager.instance;
    }

    public static initialize(scene: Phaser.Scene): void {
        CombatUIManager.instance?.obliterate();
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
        this.createConsumablesArea();
        
        this.setScrollFactorForAllElements();
    }

    private setScrollFactorForAllElements(): void {
        this.menu.container.setScrollFactor(0);
        this.endTurnButton.setScrollFactor(0);

        this.battlefieldArea.setScrollFactor(0);
        this.handArea.setScrollFactor(0);
        this.dropZoneHighlight.setScrollFactor(0);
        this.consumablesArea.setScrollFactor(0);
        this.consumablesContainer.setScrollFactor(0);
        this.slotBoxesContainer.setScrollFactor(0);

        this.energyDisplay.setScrollFactor(0);
        
        this.resourceIndicators.forEach(indicator => {
            indicator.setScrollFactor(0);
        });

        this.debugOverlay.setScrollFactor(0);

        if (this.subtitleTextBox) {
            this.subtitleTextBox.setScrollFactor(0);
        }
    }

    /** Energy is welded to the draw pile: directly above the pile icon at
     *  bottom-left. Single source of truth for create + updateLayout. */
    private getEnergyDisplayPosition(): { x: number, y: number } {
        return {
            x: this.scene.scale.width * 0.1,
            y: CombatSceneLayoutUtils.getPileY(this.scene) - 90
        };
    }

    private createEnergyDisplay(): void {
        const energyPos = this.getEnergyDisplayPosition();

        this.energyDisplay = new TextBox({
            scene: this.scene,
            x: energyPos.x,
            y: energyPos.y,
            width: 120,
            height: 60,
            text: this.getEnergyText(),
            style: {
                fontSize: '32px',
                color: Palette.BRASS_TEXT,
                fontFamily: Fonts.DISPLAY
            },
            fillColor: Palette.WOOD_PANEL,
            strokeColor: Palette.BRASS,
            textBoxName: 'EnergyDisplay'
        });

        this.scene.add.existing(this.energyDisplay);
        this.energyDisplay.setInteractive();
        this.energyTooltip = new TooltipAttachment({
            scene: this.scene,
            container: this.energyDisplay,
            tooltipText: "Energy: expended to play cards. The ration is replenished at the start of each turn.",
            fillColor: Palette.WOOD_DARK
        });
        this.scene.events.on('update', this.updateEnergyDisplay, this);
    }

    private getEnergyText(): string {
        const gameState = GameState.getInstance();
        return `${gameState.combatState.energyAvailable}/${gameState.combatState.defaultMaxEnergy}`;
    }

    private updateEnergyDisplay(): void {
        if (this.energyDisplay.getText() !== this.getEnergyText()){
            this.energyDisplay.pulseGreenBriefly();
            this.energyDisplay.setText(this.getEnergyText());
        }
    }

    private buildMenuOptions(): MenuOption[] {
        return [
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
                // Static label (not "Mute"/"Unmute") deliberately: Menu has
                // no way to relabel a single option in place, and rebuilding
                // the whole option list via updateOptions would drop the
                // "Deck Contents" entry that Menu's constructor auto-appends
                // (updateOptions doesn't repeat that step). The speaker icon
                // still flips at HqChrome; here the current console log and
                // the icon's own state (checked fresh each click) are enough.
                text: '\u{1F50A} Toggle Sound',
                callback: () => {
                    const nowMuted = SoundUtils.toggleMuted();
                    console.log(`Sound ${nowMuted ? 'muted' : 'unmuted'}.`);
                }
            },
            {
                text: 'debug:killAllEnemies',
                callback: () => {
                    const gameState = GameState.getInstance();
                    gameState.combatState.enemies.forEach(enemy => {
                        enemy.hitpoints = 0;
                    });
                    console.log("All enemies defeated for debugging purposes.");
                }
            },
            {
                text: 'debug:addTestConsumables',
                callback: () => {
                    this.addTestConsumables();
                }
            },
            {
                text: 'debug:showRandomEvent',
                callback: () => {
                    // QA debug hook to display a random event on demand
                    const event = EventsManager.getInstance().getRandomEvent();
                    this.showEvent(event);
                }
            }
        ];
    }

    private createMenu(): void {
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;

        const menuOptions: MenuOption[] = this.buildMenuOptions();

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
                fontSize: '20px',
                fontFamily: Fonts.DISPLAY,
                color: Palette.WHITE,
            },
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
        this.consumablesArea.setVisible(!this.consumablesArea.visible);
        // Toggle placeholder slot boxes along with consumable area
        this.slotBoxesContainer.setVisible(!this.slotBoxesContainer.visible);
    }

    private createEndTurnButton(): void {
        const anchor = CombatSceneLayoutUtils.getEndTurnButtonPosition(this.scene);

        this.endTurnButton = new TextBoxButton({
            scene: this.scene,
            x: anchor.x,
            y: anchor.y,
            width: 180,
            height: 56,
            text: 'End Turn',
            style: {
                fontSize: '26px',
                fontFamily: Fonts.DISPLAY,
                color: Palette.WHITE,
            },
            strokeColor: Palette.BRASS_BRIGHT,
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
        const endTurnAnchor = CombatSceneLayoutUtils.getEndTurnButtonPosition(this.scene);
        this.endTurnButton.setPosition(endTurnAnchor.x, endTurnAnchor.y);

        const menuButton = this.scene.children.getByName('MenuButton') as TextBoxButton;
        if (menuButton) {
            menuButton.setPosition(width * 0.25, 50);
        }

        this.updateGameAreas();
        this.updateConsumablesArea();

        const energyPos = this.getEnergyDisplayPosition();
        this.energyDisplay.setPosition(energyPos.x, energyPos.y);

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

        const isOverConsumables = this.consumablesArea.getBounds().contains(pointer.x, pointer.y);
        if (isOverConsumables) {
            console.log('Pointer is over the Consumables Area');
        }
    }

    private updateGameAreas(): void {
        const gameWidth = this.scene.scale.width;
        const handY = LayoutUtils.getHandY(this.scene);
        const battlefieldY = LayoutUtils.getBattlefieldY(this.scene);

        this.battlefieldArea.setPosition(gameWidth / 2, battlefieldY).setSize(gameWidth - 100, 300);
        this.handArea.setPosition(gameWidth / 2, handY).setSize(gameWidth - 100, 300);
    }

    private createConsumablesArea(): void {
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        // Position consumables on the left side of the screen
        const consumablesX = 100;
        const consumablesY = gameHeight / 2;

        // Create a container for consumables
        this.consumablesContainer = this.scene.add.container(consumablesX, consumablesY);
        this.consumablesContainer.setDepth(DepthManager.getInstance().CARD_BASE);

        // Create a visual area for consumables
        this.consumablesArea = this.scene.add.rectangle(
            consumablesX, 
            consumablesY, 
            150, 
            400
        )
        .setStrokeStyle(3, 0x3366ff)
        .setFillStyle(0x3366ff, 0.15)
        .setVisible(false)
        .setDepth(999);

        // Create placeholder boxes for consumable slots
        this.slotBoxesContainer = this.scene.add.container(consumablesX, consumablesY);
        this.slotBoxesContainer.setDepth(DepthManager.getInstance().CARD_BASE - 1);
        this.slotBoxesContainer.setVisible(true);
        const maxSlots = GameState.getInstance().maxConsumables;
        const slotSize = 64;
        const spacingY = slotSize + 16;
        this.slotBoxRefs = [];
        for (let i = 0; i < maxSlots; i++) {
            // Empty slots are faint chrome: a thin brass outline, not bright
            // white boxes competing with actual consumables for attention.
            const slotBox = this.scene.add.rectangle(0, i * spacingY, slotSize, slotSize)
                .setStrokeStyle(1, Palette.BRASS, 0.3)
                .setOrigin(0.5, 0.5);
            this.slotBoxesContainer.add(slotBox);
            this.slotBoxRefs.push(slotBox);
        }

        // Defer loading consumables to ensure scene is properly initialized
        this.scene.time.delayedCall(100, () => {
            this.loadConsumablesFromGameState();
        });
    }

    private updateConsumablesArea(): void {
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        const consumablesX = 100;
        const consumablesY = gameHeight / 2;

        this.consumablesContainer.setPosition(consumablesX, consumablesY);
        this.consumablesArea.setPosition(consumablesX, consumablesY);
        this.slotBoxesContainer.setPosition(consumablesX, consumablesY);

        // Rearrange consumables if we have any
        this.arrangeConsumables();
    }

    private loadConsumablesFromGameState(): void {
        // Clear existing consumables
        this.clearConsumables();

        // Get consumables from game state
        const gameState = GameState.getInstance();
        if (gameState.consumables.length > 0) {
            gameState.consumables.forEach(consumable => {
                this.addConsumable(consumable);
            });
        }
    }

    public addConsumable(consumable: AbstractConsumable): PhysicalConsumable {
        const index = this.activeConsumables.length;
        const physicalConsumable = new PhysicalConsumable({
            scene: this.scene,
            x: 0,
            y: index * 80, // Spacing between consumables
            abstractConsumable: consumable,
            baseSize: 64
        });

        this.activeConsumables.push(physicalConsumable);
        this.consumablesContainer.add(physicalConsumable);
        
        // Setup event handling for manual dragging
        physicalConsumable.on('consumable_dragstart', (consumable: PhysicalConsumable, pointer: Phaser.Input.Pointer) => {
            this.scene.events.emit('consumable_dragstart', consumable, pointer);
        });
        
        physicalConsumable.on('consumable_drag', (consumable: PhysicalConsumable, pointer: Phaser.Input.Pointer) => {
            this.scene.events.emit('consumable_drag', consumable, pointer);
        });
        
        physicalConsumable.on('consumable_dragend', (consumable: PhysicalConsumable, pointer: Phaser.Input.Pointer) => {
            this.scene.events.emit('consumable_dragend', consumable, pointer);
        });
        
        // Setup consumable to be activatable
        physicalConsumable.currentlyActivatable = true;

        return physicalConsumable;
    }

    public clearConsumables(): void {
        // Destroy each physical consumable
        this.activeConsumables.forEach(consumable => {
            consumable.obliterate();
        });
        this.activeConsumables = [];
        // Remove and destroy all children from the container to clear visuals
        this.consumablesContainer.removeAll(true);
    }

    public arrangeConsumables(): void {
        this.activeConsumables.forEach((consumable, index) => {
            consumable.setPosition(0, index * 80);
        });
    }

    private obliterate(): void {
        this.scene.input.off('pointermove', this.handlePointerMove, this);
        this.scene.events.off('disableInteractions', this.disableInteractions, this);
        this.scene.events.off('enableInteractions', this.enableInteractions, this);
        this.scene.events.off('consumable_depleted', this.onConsumableDepleted, this);
        this.resourceIndicators.forEach(display => display.destroy());
        this.resourceIndicators = [];
        this.scene.events.off('update', this.updateResourceIndicators, this);
        this.scene.events.off('update', this.updateEnergyDisplay, this);
        this.energyTooltip?.destroy();

        this.scene.events.off('abstractEvent:launch', this.onAbstractEventLaunch, this);
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
        this.clearConsumables();
        if (this.consumablesArea) {
            this.consumablesArea.destroy();
        }
        if (this.consumablesContainer) {
            this.consumablesContainer.destroy();
        }
        if (this.slotBoxesContainer) {
            this.slotBoxesContainer.destroy();
        }
    }

    private createResourceIndicators(): void {
        const resources = GameState.getInstance().combatState.combatResources;
        const resourceArray = resources.resources();

        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;
        // Compact column, raised so its bottom clears the End Turn corner
        // (bottom edge at ~height*0.78), x kept inboard of the roster.
        const startX = gameWidth - 300;
        const spacingY = 58;
        const columnHeight = resourceArray.length * spacingY;
        const startY = gameHeight * 0.78 - columnHeight + spacingY / 2;

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

    public onCombatStart(): void {
        this.combatEnded = false;
        this.generalRewardScreen?.hide();

        // Load consumables at combat start
        this.loadConsumablesFromGameState();
    }

    public onCombatEnd(): void {
        if (this.combatEnded) return;
        console.log("Combat ended");
        this.combatEnded = true;

        const rewards = this.determineRewards();
        if (rewards.length > 0) {
            this.generalRewardScreen = new GeneralRewardScreen(this.scene, rewards);
            this.generalRewardScreen.show();
        } else {
            console.log("No rewards to show for this combat");
        }
    }

    private determineRewards(): AbstractReward[] {
        // The active sortie provides rewards for each combat it contains.
        const sortie = SortieManager.getInstance();
        if (sortie.isActive()) {
            return sortie.getRewardsForCurrentCombat();
        }
        return [];
    }

    public disableInteractions(): void {
        this.endTurnButton.setButtonEnabled(false);
        
        // Disable consumable interactions
        this.activeConsumables.forEach(consumable => {
            consumable.disableInteractive();
            consumable.currentlyActivatable = false;
        });
    }

    public enableInteractions(): void {
        this.endTurnButton.setButtonEnabled(true);
        
        // Enable consumable interactions
        this.activeConsumables.forEach(consumable => {
            consumable.setInteractive();
            consumable.currentlyActivatable = true;
        });
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
    
    private addTestConsumables(): void {
        // Clear existing consumables first
        this.clearConsumables();
        
        // Import and use ConsumablesLibrary
        const { ConsumablesLibrary } = require('../../consumables/ConsumablesLibrary');
        const consumablesLibrary = ConsumablesLibrary.getInstance();
        
        // Get all available consumables
        const allConsumables = consumablesLibrary.getAllConsumables();
        
        // Add to the game state and display
        const gameState = GameState.getInstance();
        gameState.consumables = allConsumables;
        
        // Add all consumables to the UI
        this.loadConsumablesFromGameState();
        
        console.log(`Added ${allConsumables.length} test consumables for debugging`);
    }

    public showEvent(event: AbstractEvent): void {
        if (this.eventWindow) {
            this.eventWindow.destroy();
        }
        // Initialize the event so any random selections are ready for choices
        if (event.init) {
            event.init();
        }

        this.eventWindow = new EventWindow(
            this.scene,
            event,
            (nextEvent: AbstractEvent | null) => {
                if (nextEvent) {
                    nextEvent.parentEvent = event;
                    this.showEvent(nextEvent);
                } else {
                    this.eventWindow?.destroy();
                }
            }
        );
        this.eventWindow.setScrollFactor(0);
    }

    /**
     * Shows a reward screen with custom rewards
     * @param rewards - Array of AbstractReward to display
     * @param setRewardContext - Whether to set the UI context to reward screen (defaults to true)
     */
    public showCustomRewards(rewards: AbstractReward[], setRewardContext: boolean = true): void {
        if (rewards.length === 0) {
            console.log("No custom rewards to show");
            return;
        }

        console.log("Showing custom rewards screen");
        this.generalRewardScreen = new GeneralRewardScreen(this.scene, rewards);
        this.generalRewardScreen.show();
        
    }
}

export default CombatUIManager;

