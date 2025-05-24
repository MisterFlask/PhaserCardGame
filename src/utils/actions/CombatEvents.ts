import { PlayableCard } from "../../gamecharacters/PlayableCard";
import { BaseCharacter } from "../../gamecharacters/BaseCharacter";
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
export class CharacterDeathEvent extends AbstractCombatEvent {
    constructor(public deadCharacter: BaseCharacter, public killer: BaseCharacter | null) {
        super();
    }

    printJson(): void {
        console.log(`{"event": "CharacterDeathEvent", "dead": "${this.deadCharacter.name}", "killer": "${this.killer?.name ?? ''}"}`);
    }
}
