import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { AbstractCombatResource } from './AbstractCombatResource';

export class VentureResource extends AbstractCombatResource {
    private static readonly DRAW_CARD_COST: number = 2;

    constructor() {
        super(
            "Venture",
            `Spend ${VentureResource.DRAW_CARD_COST} Venture: Draw a card`,
            'venture_icon',
            TextGlyphs.getInstance().ventureIcon
        );
        this.tint = 0xFFD700;
    }

    public onClick(): boolean {
        if (this.value >= VentureResource.DRAW_CARD_COST) {
            ActionManager.getInstance().DoAThing("Venture Resource Click", () => {
                ActionManager.getInstance().drawCards(1);
                this.value -= VentureResource.DRAW_CARD_COST;

            });
            return true;
        }
        return false;
    }
} 