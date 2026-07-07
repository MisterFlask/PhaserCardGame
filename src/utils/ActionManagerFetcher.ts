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

    public static async initServicesAsync(scene: Phaser.Scene): Promise<void> {
        const { ActionManager } = await import('./ActionManager');
        const { GameState } = await import('../rules/GameState');
        this._actionManager = ActionManager.getInstance();
        this._gameState = GameState.getInstance();

        // Year-based hardening for event-spawned combats, registered here
        // via dynamic import for the same reason this class exists at all:
        // AbstractEvent is evaluated very early in the module graph (every
        // event imports it), and a top-level CampaignUiState/Lethality
        // import there reorders webpack module init so PlayerCharacter's
        // class-extends runs before BaseCharacter is defined — the game
        // then dies at boot with "Class extends value undefined"
        // (root-caused July 2026; do not "simplify" this into a static
        // import in AbstractEvent).
        const { CampaignUiState } = await import('../screens/campaign/hq_ux/CampaignUiState');
        const { applyHpHardening, hardeningForYear } = await import('../campaign/EncounterHardening');
        const { Lethality } = await import('../gamecharacters/buffs/standard/Lethality');
        this._encounterHardener = (enemies) => {
            const year = CampaignUiState.getInstance().calendar.year;
            applyHpHardening(enemies, year);
            const { lethalityBonus } = hardeningForYear(year);
            if (lethalityBonus > 0) {
                enemies.forEach(enemy => {
                    enemy.applyBuffs_useFromActionManager([new Lethality(lethalityBonus)]);
                });
            }
        };
    }

    private static _encounterHardener:
        | ((enemies: {
              maxHitpoints: number;
              hitpoints: number;
              applyBuffs_useFromActionManager: (buffs: any[]) => void;
          }[]) => void)
        | null = null;

    /** Applies year-based combat hardening (same numbers as
     *  SortieManager.launchNextCombat) to event-spawned enemies. Safe no-op
     *  with a warning if called before initServicesAsync — events only fire
     *  mid-combat, long after init. */
    public static applyEventCombatHardening(
        enemies: {
            maxHitpoints: number;
            hitpoints: number;
            applyBuffs_useFromActionManager: (buffs: any[]) => void;
        }[]
    ): void {
        if (!this._encounterHardener) {
            console.warn('applyEventCombatHardening called before initServicesAsync; enemies not hardened.');
            return;
        }
        this._encounterHardener(enemies);
    }
}
