import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class MettleResource extends AbstractCombatResource {
    private static readonly METTLE_COST: number = 1;
    private static readonly BLOCK_AMOUNT: number = 2;

    constructor() {
        super(
            "Mettle",
            `Spend ${MettleResource.METTLE_COST} Mettle: all characters gain ${MettleResource.BLOCK_AMOUNT} Block.`,
            'iron_icon',
            TextGlyphs.getInstance().mettleIcon
        );
        this.tint = 0x808080;
    }

    public onClick(): boolean {
        const gameState = GameState.getInstance();
        if (this.value >= MettleResource.METTLE_COST) {
            ActionManager.getInstance().DoAThing("Iron Resource Click", () => {
                gameState.combatState.allPlayerAndEnemyCharacters.forEach(character => {
                    ActionManager.getInstance().applyBlock({
                        baseBlockValue: MettleResource.BLOCK_AMOUNT,
                        blockTargetCharacter: character
                    });
                });
                this.value -= MettleResource.METTLE_COST;
            });
            return true;
        }
        return false;
    }
} 