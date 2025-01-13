import { PlayableCard } from "../../gamecharacters/PlayableCard";
import { AbstractCombatEvent } from "../../rules/AbstractCombatEvent";
import { AbstractCombatResource } from "../../rules/combatresources/AbstractCombatResource";

export class SpentCombatResourceEvent extends AbstractCombatEvent {
    printJson(): void {
        console.log(`{"event": "SpentCombatResourceEvent", "resource": "${this.resourceAfterSpending.name}", "spent": ${this.spent}}`);
    }
    constructor(
        public resourceAfterSpending: AbstractCombatResource,
        public spent: number
    ) {
        super();
    }
}

export class ExhaustEvent extends AbstractCombatEvent {
    printJson(): void {
        console.log(`{"event": "ExhaustEvent", "card": "${this.card.name}"}`);
    }
    constructor(public card: PlayableCard) {
        super();
    }
} 