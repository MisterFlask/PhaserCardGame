import { AbstractCombatResource } from './AbstractCombatResource';

export class PagesResource extends AbstractCombatResource {
    constructor() {
        super(
            "Pages",
            "If you win combat with 4 Pages, gain an additional card reward option. If you gain 10, get 2 instead.",
            'pages_icon'
        );
    }

    public onClick(): void {} // Pages is passive, no onClick needed
} 