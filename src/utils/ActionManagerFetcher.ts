import type { ActionManager } from './ActionManager';

export class ActionManagerFetcher {
    private static _actionManager: ActionManager | null = null;

    public static getActionManager(): ActionManager {
        if (!this._actionManager) {
            throw new Error('ActionManager not initialized. Call initActionManager() first.');
        }
        return this._actionManager;
    }

    public static async initActionManager(): Promise<void> {
        if (!this._actionManager) {
            const { ActionManager } = await import('./ActionManager');
            this._actionManager = ActionManager.getInstance();
        }
    }
}
