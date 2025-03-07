import { TemporaryLethality } from '../../gamecharacters/buffs/standard/TemporaryLethality';
import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class PluckResource extends AbstractCombatResource {
    private static readonly PLUCK_COST: number = 1;
    private static readonly TEMPORARY_LETHALITY_AMOUNT: number = 2;

    constructor() {
        super(
            "Pluck",
            `Spend ${PluckResource.PLUCK_COST} Pluck: Grant ${PluckResource.TEMPORARY_LETHALITY_AMOUNT} Temporary Lethality to all allies.`,
            'feather_icon',
            TextGlyphs.getInstance().pluckIcon
        );
        this.tint = 0x00ff00;
    }

    public onClick(): boolean {
        const gameState = GameState.getInstance();
        if (this.value >= PluckResource.PLUCK_COST) {
            ActionManager.getInstance().DoAThing("Pluck Resource Click", () => {
                GameState.getInstance().combatState.playerCharacters.forEach(character => {
                    ActionManager.getInstance().applyBuffToCharacterOrCard(character, new TemporaryLethality(PluckResource.TEMPORARY_LETHALITY_AMOUNT));
                });
                this.value -= PluckResource.PLUCK_COST;
            });
            return true;
        }
        return false;
    }
} 