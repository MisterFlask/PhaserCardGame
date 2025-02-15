import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class BloodResource extends AbstractCombatResource {
    constructor() {
        super(
            "Blood",
            "Spend 3 Blood: gain 1 Energy.",
            'blood_icon',
            TextGlyphs.getInstance().bloodIcon
        );
        this.tint = 0xff0000;
    }

    public onClick(): boolean {
        const gameState = GameState.getInstance();
        if (this.value >= 3) {
            ActionManager.getInstance().DoAThing("Blood Resource Click", () => {
                ActionManager.getInstance().gainEnergy(1);
                this.value -= 3;
            });
            return true;
        }
        return false;
    }
} 