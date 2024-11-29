import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { AbstractCombatResource } from './AbstractCombatResource';

export class VentureResource extends AbstractCombatResource {
    constructor() {
        super(
            "Venture",
            "Spend 1 Venture: Draw a card",
            'venture_icon',
            TextGlyphs.getInstance().ventureIcon
        );
        this.tint = 0xFFD700;
    }

    public onClick(): void {
        if (this.value >= 1) {
            ActionManager.getInstance().DoAThing("Venture Resource Click", () => {
                ActionManager.getInstance().drawCards(1);
                this.value -= 1;
            });
        }
    }
} 