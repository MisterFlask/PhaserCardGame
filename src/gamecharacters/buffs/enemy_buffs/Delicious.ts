import { DamageInfo } from "../../../rules/DamageInfo";
import { PlayableCard } from "../../AbstractCard";
import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";
import { Strong } from "../Strong";

export class Delicious extends AbstractBuff {
    override getName(): string {
        return "Delicious";
    }

    override getDescription(): string {
        return `When struck, grants ${this.stacks} Strength to the attacker.`;
    }

    constructor(stacks: number = 1) {

        super();
        this.imageName = "pizza-slice"; // Replace with actual icon name
        this.stacks = stacks;
        this.stackable = true; // This buff now stacks
    }

    override onOwnerStruck(strikingUnit: BaseCharacter, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void {
        const strongBuff = new Strong(this.stacks);
        AbstractBuff._applyBuffToCharacter(strikingUnit, strongBuff);
    }
}
