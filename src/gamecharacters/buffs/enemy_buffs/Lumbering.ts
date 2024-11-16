import { IBaseCharacter } from "../../IBaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class Lumbering extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
        this.secondaryStacks = 0;
        this.showSecondaryStacks = true;
    }

    override getName(): string {
        return "Lumbering";
    }

    override getDescription(): string {
        return `Every time a card is played, takes ${this.getStacksDisplayText()} additional damage from attacks for the rest of the turn. Currently taking ${this.secondaryStacks} additional damage.`;
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard): void {
        this.secondaryStacks += this.stacks;
    }

    override getAdditionalPercentCombatDamageDealtModifier(target?: IBaseCharacter): number {
        return this.secondaryStacks;
    }

    override onTurnEnd_CharacterBuff(): void {
        this.secondaryStacks = 0;
    }
}
