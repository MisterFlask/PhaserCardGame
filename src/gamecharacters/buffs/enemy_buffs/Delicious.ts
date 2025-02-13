import { DamageInfo } from "../../../rules/DamageInfo";
import { ActionManager } from "../../../utils/ActionManager";
import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { NextTurnLethality } from "../standard/NextTurnLethality";
export class Delicious extends AbstractBuff {
    override getDisplayName(): string {
        return "Delicious";
    }

    override getDescription(): string {
        return `When struck, grants ${this.stacks} Lethality to the attacker.`;
    }

    constructor(stacks: number = 1) {

        super();
        this.imageName = "pizza-slice"; // Replace with actual icon name
        this.stacks = stacks;
        this.stackable = true; // This buff now stacks
    }

    override onOwnerStruck_CannotModifyDamage(strikingUnit: BaseCharacter, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void {
        const strongBuff = new NextTurnLethality(this.stacks);
        ActionManager.getInstance().applyBuffToCharacterOrCard(strikingUnit, strongBuff);
    }
}
