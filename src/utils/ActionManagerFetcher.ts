import type { GameState } from '../rules/GameState';
import type { ActChanger } from '../screens/ActChanger';
import type { ActionManager } from './ActionManager';

export class ActionManagerFetcher {
    private static _actionManager: ActionManager | null = null;
    private static _gameState: GameState | null = null;
    private static _actChanger: ActChanger | null = null;

    public static isInitialized(): boolean {
        return this._actionManager !== null && this._gameState !== null && this._actChanger !== null;
    }

    public static getActionManager(): ActionManager {
        if (!this._actionManager) {
            throw new Error('ActionManager not initialized. Call initActionManagerAndGameState() first.');
        }
        return this._actionManager;
    }

    public static getGameState(): GameState {
        if (!this._gameState) {
            throw new Error('GameState not initialized. Call initActionManagerAndGameState() first.');
        }
        return this._gameState;
    }

    public static getActChanger(): ActChanger {
        if (!this._actChanger) {
            throw new Error('ActChanger not initialized. Call initActionManagerAndGameState() first.');
        }
        return this._actChanger;
    }

    public static async initServicesAsync(scene: Phaser.Scene): Promise<void> {
        const { ActionManager } = await import('./ActionManager');
        const { GameState } = await import('../rules/GameState');
        const { ActChanger } = await import('../screens/ActChanger');
        this._actionManager = ActionManager.getInstance();
        this._gameState = GameState.getInstance();
        this._actChanger = ActChanger.getInitialInstance(scene);
    }
}
