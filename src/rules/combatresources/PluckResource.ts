import { TemporaryLethality } from '../../gamecharacters/buffs/standard/TemporaryLethality';
import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class PluckResource extends AbstractCombatResource {
    constructor() {
        super(
            "Pluck",
            "Spend 1 Pluck: Grant 2 Temporary Lethality to all allies.",
            'feather_icon',
            TextGlyphs.getInstance().pluckIcon
        );
        this.tint = 0x00ff00;
    }

    public onClick(): void {
        const gameState = GameState.getInstance();
        if (this.value >= 1) {
            ActionManager.getInstance().DoAThing("Pluck Resource Click", () => {
                GameState.getInstance().combatState.playerCharacters.forEach(character => {
                    ActionManager.getInstance().applyBuffToCharacterOrCard(character, new TemporaryLethality(2));
                });
                this.value -= 1;
            });
        }
    }
} 