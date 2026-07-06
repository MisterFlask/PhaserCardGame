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
import { SortieManager } from '../campaign/SortieManager';
import { levelFromXp, pendingLevels, xpCostForLevel, xpForCombatWin } from '../campaign/Leveling';
import { applyPromotion } from '../campaign/Promotion';
import { CardRewardsGenerator } from '../rules/CardRewardsGenerator';
import { GameState } from '../rules/GameState';
import { CampaignSerializer } from '../saveload/CampaignSerializer';
import { SaveRegistries } from '../saveload/SaveRegistries';
import { StandingOrdersState } from '../campaign/orders/StandingOrdersState';
import { CampaignUiState } from './campaign/hq_ux/CampaignUiState';
import { TextBoxButton } from '../ui/Button';
import { CheapGlowEffect } from '../ui/CheapGlowEffect';
import { CombatHighlightsManager } from '../ui/CombatHighlightsManager';
import { DepthManager } from '../ui/DepthManager';
import InventoryPanel from '../ui/InventoryPanel';
import CombatSceneLayoutUtils from '../ui/LayoutUtils';
import { PhysicalCard } from '../ui/PhysicalCard';
import { UIContext, UIContextManager } from '../ui/UIContextManager';
import { loadCompanyFonts } from '../ui/UIStyle';
import { ActionManager } from '../utils/ActionManager';
import { ActionManagerFetcher } from '../utils/ActionManagerFetcher';
import ImageUtils from '../utils/ImageUtils';
import { installLoaderWatchdog } from '../utils/LoaderWatchdog';
import { runSmokeTest } from '../utils/SmokeTest';
import { HqScene } from './campaign/hq_ux/HqScene';
import { SceneChanger } from './SceneChanger';
import { CampaignBriefStatus } from './subcomponents/CampaignBriefStatus';
import { CharacterDeckOverlay } from './subcomponents/CharacterDeckOverlay';
import CombatCardManager from './subcomponents/CombatCardManager';
import CombatInputHandler from './subcomponents/CombatInputHandler';
import CombatStateService from './subcomponents/CombatStateService';
import CombatUIManager from './subcomponents/CombatUiManager';
import { DetailsScreenManager } from './subcomponents/DetailsScreenManager';
import PerformanceMonitor from './subcomponents/PerformanceMonitor';

/**
 * Interface for initializing CombatScene with necessmorniary data.
 */
export class CombatSceneData {
    encounter: Encounter = new Encounter([], -1, -1);
}

class CombatScene extends Phaser.Scene {
    private uiManager!: CombatUIManager;
    private cardManager!: CombatCardManager;
    private inputHandler!: CombatInputHandler;
    private performanceMonitor!: PerformanceMonitor;
    private background!: Phaser.GameObjects.Image;
    private inventoryPanel!: InventoryPanel;
    private detailsScreenManager!: DetailsScreenManager;
    private mapButton!: TextBoxButton;
    private mapButtonGlow!: CheapGlowEffect;
    private lastMapButtonText: string = '';
    private campaignBriefStatus!: CampaignBriefStatus;
    private characterDeckOverlay!: CharacterDeckOverlay;
    private combatEndHandled: boolean = false;

    private eventToRunNext?: AbstractEvent;
    private hasEventBeenRun: boolean = false;
    private currentEncounterEventAfterCombat: boolean = false;
    private initialData: CombatSceneData = new CombatSceneData();

    private setNewEvent(event?: AbstractEvent): void {
        this.eventToRunNext = event;
        this.hasEventBeenRun = false;
    }

    constructor() {
        super('CombatScene');
    }

    preload(): void {
        // Keep the loader alive if the tab is hidden during boot.
        installLoaderWatchdog(this);

        // Add all images to the load queue (served from local resources/)
        new ImageUtils().loadAllImages(this.load);

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
        }

        // Start new combat
        ActionManager.getInstance().startCombat();

        // Set up event if present in the encounter
        this.currentEncounterEventAfterCombat = data.encounter.eventAfterCombat;
        if (data.encounter.event) {
            this.setNewEvent(data.encounter.event);
            if (this.currentEncounterEventAfterCombat) {
                // Prevent the event from triggering until combat ends
                this.hasEventBeenRun = true;
            }
        } else {
            this.currentEncounterEventAfterCombat = false;
        }
    }

    create(): void {
        this.createBackground();

        // Initialize CombatUIManager as a singleton
        CombatUIManager.initialize(this);
        this.uiManager = CombatUIManager.getInstance();

        this.cardManager = new CombatCardManager(this);
        this.inputHandler = new CombatInputHandler(this, this.cardManager);
        this.performanceMonitor = new PerformanceMonitor(this);

        // Initialize DetailsScreenManager
        this.detailsScreenManager = new DetailsScreenManager(this);

        this.setupResizeHandler();
        GameState.getInstance().combatState.currentTurn = 0;
        ActionManager.getInstance().startCombat();
        ActionManager.beginTurn()

        this.inventoryPanel = new InventoryPanel(this);
        this.events.once('shutdown', this.obliterate, this);
        this.events.once('destroy', this.obliterate, this);

        // Create the sortie-advance button (labeled by update() as the sortie progresses)
        this.mapButton = new TextBoxButton({
            scene: this,
            x: 300,
            y: 100,
            width: 100,
            height: 40,
            text: 'Objective',
            style: { fontSize: '24px' },
            textBoxName: 'mapButton',
            fillColor: 0x555555
        });
        this.mapButton
            .onClick(() => {
                // The button advances the sortie once combat is won.
                if (this.combatEndHandled) {
                    SortieManager.getInstance().advance();
                }
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

        this.events.on("cleanupAndRestartCombat", (data: CombatSceneData) => {
            this.cleanupAndRestartCombat(data);
        });

        // Add new event listener for exhaust pile clicks
        this.events.on('exhaustPileClicked', () => {
            if (UIContextManager.getInstance().getContext() === UIContext.COMBAT) {
                this.characterDeckOverlay.showCardInExhaustPile();
            }
        });

        // Add event listener for background changes
        this.events.on('changeBackground', (backgroundName: string) => {
            this.changeBackground(backgroundName);
        });

        this.cleanupAndRestartCombat(this.initialData);
    }

    private obliterate(): void {
        this.events.off('shutdown', this.obliterate, this);
        this.events.off('destroy', this.obliterate, this);
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
        const backgroundName = "hell-oil-painting";

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

        // During a contract sortie the button advances the sortie instead of opening the map
        const sortie = SortieManager.getInstance();
        if (sortie.isActive()) {
            const desiredText = !this.combatEndHandled
                ? 'Objective'
                : (sortie.combatsRemaining() > 1 ? 'Continue' : 'Return to HQ');
            if (this.lastMapButtonText !== desiredText) {
                this.lastMapButtonText = desiredText;
                this.mapButton.setText(desiredText);
            }
        }
        
        // Update glow effect
        this.mapButtonGlow.update();

        // Sync the hand with the game state
        if (this.cardManager) {
            this.cardManager.syncHandWithGameState();
        }

        // Squad wipe during a sortie: the contract fails and the roster pays.
        if (!this.combatEndHandled
            && SortieManager.getInstance().isActive()
            && GameState.getInstance().combatState.playerCharacters.length > 0
            && GameState.getInstance().combatState.playerCharacters.every(c => c.isDead())) {
            this.combatEndHandled = true;
            SortieManager.getInstance().handleSquadWipe();
            return;
        }

        // Check if combat is finished
        if (this.isCombatFinished() && !this.combatEndHandled) {
            this.combatEndHandled = true;
            console.log("Combat finished");
            ActionManager.getInstance().endCombat();
            this.cardManager.onCombatEnd();
            this.uiManager.onCombatEnd();
            if (this.currentEncounterEventAfterCombat && this.eventToRunNext) {
                // Allow the post-combat event to trigger
                this.hasEventBeenRun = false;
            }
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
            if (!this.currentEncounterEventAfterCombat || (this.currentEncounterEventAfterCombat && this.combatEndHandled)) {
                this.uiManager.showEvent(this.eventToRunNext);
                this.hasEventBeenRun = true;
            }
        }
    }

    /**
     * Determine if combat is finished (all enemies are dead).
     */
    private isCombatFinished(): boolean {
        return GameState.getInstance().combatState.enemies.every(enemy => enemy.isDead());
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
        pixelArt: false,
        preserveDrawingBuffer: true
    },
    scene: [HqScene, CombatScene]
};

// Company typefaces load in parallel with the (much slower) asset preload.
loadCompanyFonts();

// Instantiate and start the Phaser game
const game = new Phaser.Game(gameConfig);

// Phaser hard-pauses its loop in hidden tabs (rAF suspension + onHidden ->
// loop.pause()), freezing scene transitions, tweens, and the action queue.
// Main-thread timers are throttled to ~1Hz in hidden tabs, but Web Worker
// timers are not — so a worker drives the steps, keeping the game running at
// near-full speed in the background (and testable while headless).
function installBackgroundStepper(): void {
    const step = () => {
        if (document.hidden && game.isBooted) {
            (game.loop as any).step(performance.now());
        }
    };
    try {
        const workerSource = `setInterval(function () { postMessage(0); }, 33);`;
        const worker = new Worker(URL.createObjectURL(
            new Blob([workerSource], { type: 'application/javascript' })
        ));
        worker.onmessage = step;
        window.addEventListener('beforeunload', () => worker.terminate());
    } catch {
        // Worker unavailable (e.g. strict CSP): degrade to throttled stepping.
        const intervalId = setInterval(step, 100);
        window.addEventListener('beforeunload', () => clearInterval(intervalId));
    }
}
installBackgroundStepper();

// Debug hooks for automated testing (browser console / test harness access)
(window as any).game = game;
(window as any).getGameState = () => GameState.getInstance();
(window as any).getCampaignState = () => CampaignUiState.getInstance();
(window as any).getStandingOrdersState = () => StandingOrdersState.getInstance();
// Registry doubles as a console factory for buffs/cards during testing.
(window as any).SaveRegistries = SaveRegistries;
(window as any).getActionQueueErrors = () => ActionManager.getInstance().actionQueue.lastErrors;
// Drives the full sortie loop (HQ -> dispatch -> combat -> payout -> HQ ->
// save/reload) headlessly and reports compact JSON; see src/utils/SmokeTest.ts.
(window as any).runSmokeTest = () => runSmokeTest();
// Soldier leveling debug hooks (Amendment: Soldier Levels & Promotions).
// The promotion UI (card-pick screen, Barracks PROMOTE button) is a later
// piece of work; until it exists these are the only way to drive a
// promotion from outside a unit test.
(window as any).Leveling = { levelFromXp, pendingLevels, xpCostForLevel, xpForCombatWin };
(window as any).applyPromotion = applyPromotion;
(window as any).CardRewardsGenerator = CardRewardsGenerator;
(window as any).CampaignSerializer = CampaignSerializer;

export default CombatScene;
