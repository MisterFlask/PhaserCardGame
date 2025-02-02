import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class WellDrilled extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Well-Drilled";
    }

    override getDescription(): string {
        return `Revolver attacks played by this character deal ${this.getStacksDisplayText()} additional damage.`;
    }

    override getCombatDamageDealtModifier(target: BaseCharacter, cardPlayed?: PlayableCard): number {
        if (cardPlayed == null) {
            return 0;
        }

        if (cardPlayed?.name?.toLowerCase()?.includes("revolver")) {
            return this.stacks;
        }
        return 0;
    }
}
