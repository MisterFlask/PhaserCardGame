import { DamageInfo } from "../../../rules/DamageInfo";
import { ActionManager } from "../../../utils/ActionManager";
import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { Stress } from "./Stress";

export class Terrifying extends AbstractBuff {
    override getDisplayName(): string {
        return "Terrifying";
    }

    override getDescription(): string {
        return `Applies ${this.getStacksDisplayText()} additional Stress whenever it successfully damages someone.`;
    }

    constructor(stacks: number = 1) {
        super();
        this.imageName = "shattered-heart"; // Replace with actual icon name
        this.stacks = stacks;
        this.stackable = true;
    }

    override onOwnerStriking_CannotModifyDamage(struckUnit: BaseCharacter, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void {
        if (damageInfo.unblockedDamageTaken > 0) {
            const stressBuff = new Stress(this.stacks);
            ActionManager.getInstance().applyBuffToCharacterOrCard(struckUnit, stressBuff);
            console.log(`${struckUnit.name} received ${this.stacks} Stress from Terrifying effect`);
        }
    }
}
