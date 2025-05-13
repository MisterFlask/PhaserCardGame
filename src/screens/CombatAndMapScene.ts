// src/scenes/CombatAndMapScene.ts
// src/scenes/CombatAndMapScene.ts

import Phaser from 'phaser';
import BBCodeTextPlugin from 'phaser3-rex-plugins/plugins/bbcodetext-plugin';
import CameraControllerPlugin from 'phaser3-rex-plugins/plugins/cameracontroller-plugin.js';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import { Encounter } from '../encounters/EncounterManager';
import { AbstractEvent } from '../events/AbstractEvent';
import type { AbstractCard } from '../gamecharacters/AbstractCard';
import { PlayerCharacter } from '../gamecharacters/PlayerCharacter';
import { GameState } from '../rules/GameState';
import { TextBoxButton } from '../ui/Button';
import { CheapGlowEffect } from '../ui/CheapGlowEffect';
import { CombatHighlightsManager } from '../ui/CombatHighlightsManager';
import { DepthManager } from '../ui/DepthManager';
import InventoryPanel from '../ui/InventoryPanel';
import CombatSceneLayoutUtils from '../ui/LayoutUtils';
import { PhysicalCard } from '../ui/PhysicalCard';
import { UIContext, UIContextManager } from '../ui/UIContextManager';
import { ActionManager } from '../utils/ActionManager';
import { ActionManagerFetcher } from '../utils/ActionManagerFetcher';
import ImageUtils from '../utils/ImageUtils';
import { HqScene } from './campaign/hq_ux/HqScene';
import { SceneChanger } from './SceneChanger';
import { CampaignBriefStatus } from './subcomponents/CampaignBriefStatus';
import { CharacterDeckOverlay } from './subcomponents/CharacterDeckOverlay';
import CombatCardManager from './subcomponents/CombatCardManager';
import CombatInputHandler from './subcomponents/CombatInputHandler';
import CombatStateService from './subcomponents/CombatStateService';
import CombatUIManager from './subcomponents/CombatUiManager';
import { DetailsScreenManager } from './subcomponents/DetailsScreenManager';
import { MapOverlay } from './subcomponents/MapOverlay';
import PerformanceMonitor from './subcomponents/PerformanceMonitor';
import { ShopOverlay } from './subcomponents/ShopOverlay';
import { TreasureOverlay } from './subcomponents/TreasureOverlay';

/**
 * Interface for initializing CombatScene with necessmorniary data.
 */
export class CombatSceneData {
    encounter: Encounter = new Encounter([], -1, -1);
    shouldStartWithMapOverlay: boolean = false;
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
    private mapButtonGlow!: CheapGlowEffect;
    private campaignBriefStatus!: CampaignBriefStatus;
    private characterDeckOverlay!: CharacterDeckOverlay;
    private treasureOverlay!: TreasureOverlay;
    private combatEndHandled: boolean = false;

    private eventToRunNext?: AbstractEvent;
    private hasEventBeenRun: boolean = false;
    private sceneStartsWithMapOverlayUp: boolean = false;
    private initialData: CombatSceneData = new CombatSceneData();

    private setNewEvent(event?: AbstractEvent): void {
        this.eventToRunNext = event;
        this.hasEventBeenRun = false;
    }

    constructor() {
        super('CombatScene');
    }

    preload(): void {
        this.load.setBaseURL('https://raw.githubusercontent.com/');
        
        // Add all images to the load queue
        new ImageUtils().loadAllImages(this.load);
        
        this.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true);
        ActionManagerFetcher.initServicesAsync(this);
    }

    init(data: CombatSceneData): void {
        SceneChanger.setCurrentScene(this);
        ActionManager.init(this);

        this.combatEndHandled = false;
        this.initialData = data;
    }

    cleanupAndRestartCombat(data: CombatSceneData): void {
        this.uiManager.onCombatStart();
        console.log("cleanupAndRestartCombat called with ", data);
        
        // Clean up existing combat state
        GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
        
        // Reinitialize combat state with new encounter
        const stateService = CombatStateService.getInstance();
        stateService.initializeCombat(data.encounter, GameState.getInstance().currentRunCharacters);

        this.changeBackground(data.encounter.getBackgroundName());
        
        // Reset combat flags
        this.combatEndHandled = false;
        
        // Recreate all combat-related objects
        if (this.cardManager) {
            this.cardManager.cleanup();
            this.cardManager = new CombatCardManager(this);
        }

        // Reinitialize input handler with new card manager
        if (this.inputHandler) {
            this.inputHandler.cleanup();
            this.inputHandler = new CombatInputHandler(this, this.cardManager);
            
            // Re-add the card click listener
            this.events.on("card:pointerdown", (card: PhysicalCard) => {
                this.onCardPointerDown(card);
            });
        }
        
        // Start new combat
        ActionManager.getInstance().startCombat();

        // Set up event if present in the encounter
        if (data.encounter.event) {
            this.setNewEvent(data.encounter.event);
        }

        // Handle map overlay
        this.toggleMapOverlay(data.shouldStartWithMapOverlay);
    }
    onCardPointerDown(card: PhysicalCard) {
        if (UIContextManager.getInstance().getContext() !== UIContext.COMBAT) return;
        this.shopOverlay.handleCardClick(card.data as AbstractCard);
        this.treasureOverlay.handleCardClickOnTreasureChest(card.data as AbstractCard);
    }



    create(): void {
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
        this.treasureOverlay = new TreasureOverlay(this);

        // Set up the onCardClick handler
        this.events.on("card:pointerdown", (card: PhysicalCard) => {
            this.onCardPointerDown(card);
        });

        this.setupResizeHandler();
        GameState.getInstance().combatState.currentTurn = 0;
        ActionManager.getInstance().startCombat();
        ActionManager.beginTurn()

        this.inventoryPanel = new InventoryPanel(this);
        this.events.once('shutdown', this.obliterate, this);
        this.events.once('destroy', this.obliterate, this);

        // Create the map button
        this.mapButton = new TextBoxButton({
            scene: this,
            x: 300,
            y: 100,
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

        // Create glow effect for map button
        this.mapButtonGlow = new CheapGlowEffect(this, this.mapButton.x, this.mapButton.y);
        this.mapButtonGlow.setScale(1.5, 0.75); // Width: 1.5x, Height: 0.75x (half height)
        this.mapButtonGlow.setDepth(this.mapButton.depth - 1); // Place behind button
        this.mapButtonGlow.turnOff();

        this.campaignBriefStatus = new CampaignBriefStatus(this, true);
        this.add.existing(this.campaignBriefStatus);
        this.campaignBriefStatus.depth = DepthManager.getInstance().COMBAT_UI;

        this.characterDeckOverlay = new CharacterDeckOverlay(this);
        this.characterDeckOverlay.hide();
        this.setupCharacterClickHandlers();

        // Add event listeners for draw and discard pile clicks
        this.events.on('drawPileClicked', () => {
            if (UIContextManager.getInstance().getContext() === UIContext.COMBAT) {
                this.characterDeckOverlay.showCardInDrawPile();
            }
        });

        this.events.on('discardPileClicked', () => {
            if (UIContextManager.getInstance().getContext() === UIContext.COMBAT) {
                this.characterDeckOverlay.showCardInDiscardPile();
            }
        });

        this.events.on("showMapOverlay", () => {
            this.toggleMapOverlay(true);
        });

        this.events.on("cleanupAndRestartCombat", (data: CombatSceneData) => {
            this.cleanupAndRestartCombat(data);
        });

        // Add new event listener for exhaust pile clicks
        this.events.on('exhaustPileClicked', () => {
            if (UIContextManager.getInstance().getContext() === UIContext.COMBAT) {
                this.characterDeckOverlay.showCardInExhaustPile();
            }
        });

        this.setNewEvent(GameState.getInstance().currentLocation?.gameEvent);
        this.toggleMapOverlay(this.sceneStartsWithMapOverlayUp);

        // Add event listener for background changes
        this.events.on('changeBackground', (backgroundName: string) => {
            this.changeBackground(backgroundName);
        });

        this.cleanupAndRestartCombat(this.initialData);
    }

    private obliterate(): void {
        this.events.off('shutdown', this.obliterate, this);
        this.events.off('destroy', this.obliterate, this);
        this.events.off('showMapOverlay', this.toggleMapOverlay, this);
        // Remove resize event listener
        this.scale.off('resize', this.resize, this);
        if (this.campaignBriefStatus) {
            this.campaignBriefStatus.destroy();
        }
        
        // Clean up the map button glow
        if (this.mapButtonGlow) {
            this.mapButtonGlow.destroy();
        }

        // Remove the pile click event listeners
        this.events.off('drawPileClicked');
        this.events.off('discardPileClicked');
        this.events.off('exhaustPileClicked');
        this.events.off('locationSelected');
        this.events.off('card:pointerdown');
        this.events.off('changeBackground');
    }

    private createBackground(): void {
        const backgroundName = GameState.getInstance().currentLocation?.backgroundName || "hell-oil-painting";

        this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, backgroundName)
            .setOrigin(0.5)
            .setDisplaySize(this.scale.width, this.scale.height)
            .setDepth(-10)
            .setName('background');
    }

    public changeBackground(backgroundName: string): void {
        this.background.setTexture(backgroundName);
        // Stretch the background to fill the scene while maintaining aspect ratio
        this.background.setDisplaySize(this.scale.width, this.scale.height)

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
            this.mapButton.setPosition(100, 200);
        }

        // Reposition map button glow effect
        if (this.mapButtonGlow) {
            this.mapButtonGlow.setPosition(this.mapButton.x, this.mapButton.y);
        }

        this.mapButton.setScrollFactor(0);
        this.background.setScrollFactor(0);
        this.campaignBriefStatus.setScrollFactor(0);

        if (this.campaignBriefStatus) {
            this.campaignBriefStatus.setPosition(333, 11);
        }

        if (this.characterDeckOverlay) {
            this.characterDeckOverlay.resize();
        }
    }

    update(time: number, delta: number): void {
        this.cardManager.drawPile.setGlow(false);
        this.cardManager.discardPile.setGlow(false);

        this.performanceMonitor.update(time, delta);

        // Make map button glow after combat ends
        if (this.combatEndHandled && this.mapButton) {
            this.mapButtonGlow.turnOn(true); // Turn on with pulsing
        } else {
            this.mapButtonGlow.turnOff();
        }
        
        // Update glow effect
        this.mapButtonGlow.update();

        // Sync the hand with the game state
        if (this.cardManager) {
            this.cardManager.syncHandWithGameState();
        }

        // Check if combat is finished
        if (this.isCombatFinished() && !this.combatEndHandled) {
            this.combatEndHandled = true;
            console.log("Combat finished");
            ActionManager.getInstance().endCombat();
            this.cardManager.onCombatEnd();
            this.uiManager.onCombatEnd();
        }

        // Update DetailsScreenManager
        this.detailsScreenManager.update();

        // Get all characters (both allies and enemies)
        const allCharacters = [...GameState.getInstance().combatState.playerCharacters, ...     GameState.getInstance().combatState.enemies];
        
        // Update highlights
        CombatHighlightsManager.getInstance().update(allCharacters);

        // Update card manager
        this.cardManager.update();

        if (this.eventToRunNext && !this.hasEventBeenRun) {
            this.uiManager.showEvent(this.eventToRunNext);
            this.hasEventBeenRun = true;
        }

        this.mapOverlay.updateDisplay();
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

    private setupCharacterClickHandlers(): void {
        this.events.on("card:pointerdown", (card: PhysicalCard) => {
            console.log("card:pointerdown event received for " + card.data.name);
            if (card.data.isPlayerCharacter()) {
                this.characterDeckOverlay.show(card.data as PlayerCharacter);
            }
        });
    }
}

/**
 * Phaser game configuration.
 */
const gameConfig: Phaser.Types.Core.GameConfig = {
    plugins: {
        global: [{
            key: 'rexBBCodeTextPlugin',
            plugin: BBCodeTextPlugin,
            start: true,
        },
        {
            key    : 'rexCameraController',
            plugin : CameraControllerPlugin,
            start  : true
            }
        ],
        scene: [{
            key: 'rexUI',
            plugin: RexUIPlugin,
            mapping: 'rexUI',
            systemKey: 'rexUI',
            sceneKey: 'rexUI'
        }]
    },
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
        roundPixels: true,
        pixelArt: false
    },
    scene: [HqScene, CombatScene]
};

// Instantiate and start the Phaser game
const game = new Phaser.Game(gameConfig);

export default CombatScene;
