import { BaseCharacter } from "../../BaseCharacter";
import { IBaseCharacter } from "../../IBaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class Frostbite extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
        this.stackable = true;
        this.imageName = "snowflake";
    }

    override getDisplayName(): string { return "Frostbite"; }
    override getDescription(): string {
        return `Lose 1 Dexterity and 1 Lethality.`;
    }

    override getBlockSentModifier(_target: IBaseCharacter): number {
        return -1 * this.stacks;
    }

    override getCombatDamageDealtModifier(_target?: BaseCharacter, _sourceCard?: PlayableCard): number {
        return -1 * this.stacks;
    }
}
