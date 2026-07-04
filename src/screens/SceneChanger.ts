import Phaser from 'phaser';
import { Encounter } from '../encounters/EncounterManager';
import { GameState } from '../rules/GameState';
import { TransientUiState } from '../ui/TransientUiState';
import { UIContextManager } from '../ui/UIContextManager';

export class SceneChanger {


    private static currentScene: Phaser.Scene | null = null;

    private static switchScene(sceneName: string, params?: object): void {
        if (SceneChanger.currentScene) {
            GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
            // Stale hover/drag refs and modal context must not leak into the next scene.
            TransientUiState.getInstance().clear();
            UIContextManager.getInstance().clearToBase();
            console.log('switching to scene:', sceneName);
            SceneChanger.currentScene.scene.start(sceneName, params);
        }else {
            console.warn(`No current scene to switch from.`);
        }
    }

    public static switchToCampaignScene(): void {
        SceneChanger.switchScene('HqScene');
    }

    public static switchToCombatScene(encounter: Encounter): void {
        SceneChanger.switchScene('CombatScene', { encounter });
    }

    public static setCurrentScene(scene: Phaser.Scene): void {
        SceneChanger.currentScene = scene;
    }

    public static getCurrentScene(): Phaser.Scene | null {
        return SceneChanger.currentScene;
    }
}