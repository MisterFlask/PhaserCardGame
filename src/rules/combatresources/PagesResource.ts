import { TextGlyphs } from '../../text/TextGlyphs';
import { AbstractCombatResource } from './AbstractCombatResource';

export class PagesResource extends AbstractCombatResource {
    constructor() {
        super(
            "Pages",
            `If you win combat with at least 4 Pages, gain an additional card reward option. At 10, get 2 instead.`,
            'papers_icon',
            TextGlyphs.getInstance().pagesIcon
        );
        this.tint = 0xF5F5DC;
    }

    public onClick(): void {} // Pages is passive, no onClick needed
} 