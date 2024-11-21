import { Lethality } from '../../gamecharacters/buffs/standard/Strong';
import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class BloodResource extends AbstractCombatResource {
    constructor() {
        super(
            "Blood",
            "Spend 1 Blood: all characters gain 2 Temporary Strength",
            'blood_icon',
            TextGlyphs.getInstance().bloodIcon
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
                        new Lethality(2)
                    );
                });
                this.value -= 1;
            });
        }
    }
} 