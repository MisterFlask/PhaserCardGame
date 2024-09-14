// src/scenes/CombatScene.ts

import Phaser from 'phaser';
import { EncounterData } from '../encounters/Encounters';
import { GameState } from '../rules/GameState';
import CombatSceneLayoutUtils from '../ui/LayoutUtils';
import GameImageLoader from '../utils/ImageUtils';
import CampaignScene from './campaign';
import MapScene from './map';
import CombatCardManager from './subcomponents/CombatCardManager';
import CombatInputHandler from './subcomponents/CombatInputHandler';
import CombatStateService from './subcomponents/CombatStateService';
import CombatUIManager from './subcomponents/CombatUiManager';
import PerformanceMonitor from './subcomponents/PerformanceMonitor';
/**
 * Interface for initializing CombatScene with necessary data.
 */
export interface CombatSceneData {
    encounter: EncounterData;
}


class CombatScene extends Phaser.Scene {
    private uiManager!: CombatUIManager;
    private cardManager!: CombatCardManager;
    private inputHandler!: CombatInputHandler;
    private performanceMonitor!: PerformanceMonitor;

    constructor() {
        super('CombatScene');
    }

    preload(): void {
        this.load.setBaseURL('https://raw.githubusercontent.com/');
        new GameImageLoader().loadAllImages(this.load);
    }

    init(data: CombatSceneData): void {
        const stateService = CombatStateService.getInstance();
        stateService.initializeCombat(data.encounter, GameState.getInstance().currentRunCharacters);
    }

    create(): void {
        this.createBackground();
        this.uiManager = new CombatUIManager(this);
        this.cardManager = new CombatCardManager(this);
        this.inputHandler = new CombatInputHandler(this, this.cardManager);
        this.performanceMonitor = new PerformanceMonitor(this);

        this.setupResizeHandler();
    }

    private createBackground(): void {
        const background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'battleback1')
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
            this.cardManager.arrangeCards(this.cardManager.enemyUnits, CombatSceneLayoutUtils.getBattlefieldY(this));
            this.cardManager.playerUnits.forEach((unit, index) => {
                unit.container.x = width - 100;
                unit.container.y = 100 + index * 180;
            });
        }
    }

    update(time: number, delta: number): void {
        this.performanceMonitor.update(time, delta);
        // Implement additional update logic if needed
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
    scene: [CampaignScene, CombatScene, MapScene]
};

// Instantiate and start the Phaser game
const game = new Phaser.Game(gameConfig);


export default CombatScene;
