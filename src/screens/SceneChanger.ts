import Phaser from 'phaser';
import { EncounterData } from '../encounters/Encounters';
import { GameState } from '../rules/GameState';

export class SceneChanger {
    private static currentScene: Phaser.Scene | null = null;

    private static switchScene(sceneName: string, params?: object): void {
        if (SceneChanger.currentScene) {
            GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
            SceneChanger.currentScene.scene.start(sceneName, params);
        }else {
            console.warn(`No current scene to switch from.`);
        }
    }

    // public static switchToMapScene(): void {
    //     SceneChanger.switchScene('MapScene');
    // }

    public static switchToCampaignScene(): void {
        SceneChanger.switchScene('Campaign');
    }

    public static switchToCombatScene({ encounter }: { encounter: EncounterData }): void {
        SceneChanger.switchScene('CombatScene', { encounter });
    }

    public static setCurrentScene(scene: Phaser.Scene): void {
        SceneChanger.currentScene = scene;
    }

    public static getCurrentScene(): Phaser.Scene | null {
        return SceneChanger.currentScene;
    }
}