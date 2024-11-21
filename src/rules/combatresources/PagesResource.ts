import { TextGlyphs } from '../../text/TextGlyphs';
import { AbstractCombatResource } from './AbstractCombatResource';

export class Ashes extends AbstractCombatResource {
    constructor() {
        super(
            "Ashes",
            `If you win combat with at least 4 Ashes, gain an additional card reward option. At 10, get 2 instead.`,
            'ashes_icon',
            TextGlyphs.getInstance().pagesIcon
        );
        this.tint = 0xF5F5DC;
    }

    public onClick(): void {} // Pages is passive, no onClick needed
} 