import Phaser from 'phaser';
import { Encounter } from '../encounters/EncountersList';
import { GameState } from '../rules/GameState';
import { TransientUiState } from '../ui/TransientUiState';

export class SceneChanger {
    
    
    private static currentScene: Phaser.Scene | null = null;

    private static switchScene(sceneName: string, params?: object): void {
        if (SceneChanger.currentScene) {
            GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
            console.log('switching to scene:', sceneName);
            SceneChanger.currentScene.scene.start(sceneName, params);
        }else {
            console.warn(`No current scene to switch from.`);
        }
    }

    // public static switchToMapScene(): void {
    //     SceneChanger.switchScene('MapScene');
    // }

    public static switchToCampaignScene(): void {
        SceneChanger.switchScene('HqScene');
    }

    public static switchToExpeditionFinishedScene(): void {
        TransientUiState.getInstance().showLiquidationPanel = true;
        SceneChanger.switchScene('HqScene');

    }

    public static switchToCombatScene(encounter: Encounter, shouldStartWithMapOverlay: boolean = false): void {
        SceneChanger.switchScene('CombatScene', { encounter, shouldStartWithMapOverlay });
    }

    public static setCurrentScene(scene: Phaser.Scene): void {
        SceneChanger.currentScene = scene;
    }

    public static getCurrentScene(): Phaser.Scene | null {
        return SceneChanger.currentScene;
    }
}