// src/scenes/CombatScene.ts

import Phaser from 'phaser';
import { EncounterData } from '../encounters/Encounters';
import type { AbstractCard } from '../gamecharacters/AbstractCard';
import { GameState } from '../rules/GameState';
import { TextBoxButton } from '../ui/Button';
import InventoryPanel from '../ui/InventoryPanel';
import CombatSceneLayoutUtils from '../ui/LayoutUtils';
import { UIContext, UIContextManager } from '../ui/UIContextManager';
import { ActionManager } from '../utils/ActionManager';
import { ActionManagerFetcher } from '../utils/ActionManagerFetcher';
import GameImageLoader from '../utils/ImageUtils';
import CampaignScene from './Campaign';
import { SceneChanger } from './SceneChanger';
import CombatCardManager from './subcomponents/CombatCardManager';
import CombatInputHandler from './subcomponents/CombatInputHandler';
import CombatStateService from './subcomponents/CombatStateService';
import CombatUIManager from './subcomponents/CombatUiManager';
import { DetailsScreenManager } from './subcomponents/DetailsScreenManager';
import { MapOverlay } from './subcomponents/MapOverlay';
import PerformanceMonitor from './subcomponents/PerformanceMonitor';
import { ShopOverlay } from './subcomponents/ShopOverlay';

/**
 * Interface for initializing CombatScene with necessmorniary data.
 */
export interface CombatSceneData {
    encounter: EncounterData;
}

class CombatScene extends Phaser.Scene {
    private uiManager!: CombatUIManager;
    private cardManager!: CombatCardManager;
    private inputHandler!: CombatInputHandler;
    private performanceMonitor!: PerformanceMonitor;
    private background!: Phaser.GameObjects.Image;
    private inventoryPanel!: InventoryPanel;
    private detailsScreenManager!: DetailsScreenManager;
    private shopOverlay!: ShopOverlay;
    private mapOverlay!: MapOverlay;
    private mapButton!: TextBoxButton;

    constructor() {
        super('CombatScene');
    }

    preload(): void {
        this.load.setBaseURL('https://raw.githubusercontent.com/');
        new GameImageLoader().loadAllImages(this.load);
    }

    init(data: CombatSceneData): void {
        SceneChanger.setCurrentScene(this);
        ActionManager.init(this);
        const stateService = CombatStateService.getInstance();
        stateService.initializeCombat(data.encounter, GameState.getInstance().currentRunCharacters);
        UIContextManager.getInstance().setContext(UIContext.COMBAT);
    }

    create(): void {
        ActionManagerFetcher.initActionManager();
        this.createBackground();

        // Initialize CombatUIManager as a singleton
        CombatUIManager.initialize(this);
        this.uiManager = CombatUIManager.getInstance();
        this.mapOverlay = new MapOverlay(this);
        this.mapOverlay.hide();

        this.cardManager = new CombatCardManager(this);
        this.inputHandler = new CombatInputHandler(this, this.cardManager);
        this.performanceMonitor = new PerformanceMonitor(this);

        // Initialize DetailsScreenManager
        this.detailsScreenManager = new DetailsScreenManager(this);

        // Initialize ShopOverlay
        this.shopOverlay = new ShopOverlay(this);

        // Set up the onCardClick handler
        this.inputHandler.addCardClickListener((card: AbstractCard) => {
            if (UIContextManager.getInstance().getContext() !== UIContext.COMBAT) return;
            this.shopOverlay.handleCardClick(card);
        });

        this.setupResizeHandler();
        ActionManager.getInstance().drawHandForNewTurn();

        this.inventoryPanel = new InventoryPanel(this);
        this.events.once('shutdown', this.obliterate, this);
        this.events.once('destroy', this.obliterate, this);

        // Create the map button
        this.mapButton = new TextBoxButton({
            scene: this,
            x: 10,
            y: 10,
            width: 100,
            height: 40,
            text: 'Map',
            style: { fontSize: '24px' },
            textBoxName: 'mapButton',
            fillColor: 0x555555
        });
        this.mapButton
            .onClick(() => {
                this.toggleMapOverlay(true);
            });
        this.add.existing(this.mapButton);
    }

    private obliterate(): void {
        this.events.off('shutdown', this.obliterate, this);
        this.events.off('destroy', this.obliterate, this);
        // Remove resize event listener
        this.scale.off('resize', this.resize, this);
    }

    private createBackground(): void {
        this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'battleback1')
            .setOrigin(0.5)
            .setDisplaySize(this.scale.width, this.scale.height)
            .setDepth(-1)
            .setName('background');
    }

    private setupResizeHandler(): void {
        this.scale.on('resize', this.resize, this);
        this.time.delayedCall(100, () => {
            this.resize();
        });
    }

    private resize(): void {
        const width = this.scale.width;
        const height = this.scale.height;

        // Update background
        const background = this.children.getByName('background') as Phaser.GameObjects.Image;
        if (background) {
            background.setDisplaySize(width, height);
            background.setPosition(width / 2, height / 2);
        }

        // Update UI layout
        if (this.uiManager) {
            this.uiManager.updateLayout(width, height);
        }

        // Rearrange cards
        if (this.cardManager) {
            this.cardManager.arrangeCards(this.cardManager.playerHand, CombatSceneLayoutUtils.getHandY(this));
            this.cardManager.playerUnits.forEach((unit, index) => {
                unit.container.x = width - 100;
                unit.container.y = 100 + index * 180;
            });
        }

        // Reposition inventory button
        this.inventoryPanel.resize(width, height);

        // Reposition map button
        if (this.mapButton) {
            this.mapButton.setPosition(10, 10);
        }
    }

    update(time: number, delta: number): void {
        if (UIContextManager.getInstance().getContext() !== UIContext.COMBAT) return;

        this.performanceMonitor.update(time, delta);

        // Sync the hand with the game state
        if (this.cardManager) {
            this.cardManager.syncHandWithGameState();
        }

        // Check if combat is finished
        if (this.isCombatFinished()) {
            this.uiManager.onCombatEnd();
        }

        // Update DetailsScreenManager
        const hoveredCard = GameState.getInstance().combatState.cardHoveredOver_transient;
        this.detailsScreenManager.update(hoveredCard);
    }

    /**
     * Determine if combat is finished (all enemies are dead).
     */
    private isCombatFinished(): boolean {
        return GameState.getInstance().combatState.enemies.every(enemy => enemy.isDead());
    }

    private toggleMapOverlay(show: boolean  ): void {
        if (show) {
            this.mapOverlay.show();
        } else {
            this.mapOverlay.hide();
        }
    }

}

/**
 * Phaser game configuration.
 */
const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'phaser-example',
    },
    render: {
        antialias: true,
        roundPixels: false,
        pixelArt: false
    },
    scene: [CampaignScene, CombatScene]
};

// Instantiate and start the Phaser game
const game = new Phaser.Game(gameConfig);

export default CombatScene;
