import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class MettleResource extends AbstractCombatResource {
    constructor() {
        super(
            "Mettle",
            "Spend 1 Mettle: all characters gain 2 Block.",
            'iron_icon',
            TextGlyphs.getInstance().mettleIcon
        );
        this.tint = 0x808080;
    }

    public onClick(): boolean {
        const gameState = GameState.getInstance();
        if (this.value >= 1) {
            ActionManager.getInstance().DoAThing("Iron Resource Click", () => {
                gameState.combatState.allPlayerAndEnemyCharacters.forEach(character => {
                    ActionManager.getInstance().applyBlock({
                        baseBlockValue: 2,
                        blockTargetCharacter: character
                    });
                });
                this.value -= 1;
            });
            return true;
        }
        return false;
    }
} 