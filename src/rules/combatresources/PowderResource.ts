import { Strong } from '../../gamecharacters/buffs/standard/Strong';
import { ActionManager } from '../../utils/ActionManager';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class PowderResource extends AbstractCombatResource {
    constructor() {
        super(
            "Powder",
            "Spend 1 Powder: all characters gain 2 Temporary Strength",
            'powder_icon'
        );
        this.tint = 0xff0000;
    }

    public onClick(): void {
        const gameState = GameState.getInstance();
        if (this.value >= 1) {
            ActionManager.getInstance().DoAThing("Powder Resource Click", () => {
                gameState.combatState.allPlayerAndEnemyCharacters.forEach(character => {
                    ActionManager.getInstance().applyBuffToCharacterOrCard(
                        character, 
                        new Strong(2)
                    );
                });
                this.value -= 1;
            });
        }
    }
} 