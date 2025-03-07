import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class BloodResource extends AbstractCombatResource {
    private static readonly BLOOD_COST: number = 1;
    private static readonly ENERGY_GAIN: number = 1;

    constructor() {
        super(
            "Blood",
            `Spend ${BloodResource.BLOOD_COST} Blood: gain ${BloodResource.ENERGY_GAIN} Energy.`,
            'blood_icon',
            TextGlyphs.getInstance().bloodIcon
        );
        this.tint = 0xff0000;
    }

    public onClick(): boolean {
        const gameState = GameState.getInstance();
        if (this.value >= BloodResource.BLOOD_COST) {
            ActionManager.getInstance().DoAThing("Blood Resource Click", () => {
                ActionManager.getInstance().gainEnergy(BloodResource.ENERGY_GAIN);
                this.value -= BloodResource.BLOOD_COST;
            });
            return true;
        }
        return false;
    }
} 