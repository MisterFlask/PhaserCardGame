import type { GameState } from '../rules/GameState';
import type { ActionManager } from './ActionManager';

export class ActionManagerFetcher {
    private static _actionManager: ActionManager | null = null;
    private static _gameState: GameState | null = null;

    public static isInitialized(): boolean {
        return this._actionManager !== null && this._gameState !== null;
    }

    public static getActionManager(): ActionManager {
        if (!this._actionManager) {
            throw new Error('ActionManager not initialized. Call initActionManager() first.');
        }
        return this._actionManager;
    }

    public static getGameState(): GameState {
        if (!this._gameState) {
            throw new Error('GameState not initialized. Call initActionManagerAndGameState() first.');
        }
        return this._gameState;
    }

    public static async initActionManagerAndGameState(): Promise<void> {
        if (!this._actionManager) {
            const { ActionManager } = await import('./ActionManager');
            const { GameState } = await import('../rules/GameState');
            this._actionManager = ActionManager.getInstance();
            this._gameState = GameState.getInstance();
        }
    }
}
