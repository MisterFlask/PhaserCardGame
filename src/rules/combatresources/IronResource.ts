import { ActionManager } from '../../utils/ActionManager';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class IronResource extends AbstractCombatResource {
    constructor() {
        super(
            "Iron",
            "Spend 1 Iron: all characters gain 3 Block.",
            'iron_icon'
        );
    }

    public onClick(): void {
        const gameState = GameState.getInstance();
        if (this.value >= 1) {
            ActionManager.getInstance().DoAThing("Iron Resource Click", () => {
                gameState.combatState.allPlayerAndEnemyCharacters.forEach(character => {
                    ActionManager.getInstance().applyBlock({
                        baseBlockValue: 3,
                        blockTargetCharacter: character
                    });
                });
                this.value -= 1;
            });
        }
    }
} 