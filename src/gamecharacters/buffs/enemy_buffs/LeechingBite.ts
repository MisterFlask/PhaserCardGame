import { DamageInfo } from "../../../rules/DamageInfo";
import { ActionManager } from "../../../utils/ActionManager";
import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class LeechingBite extends AbstractBuff {
    constructor(healAmount: number = 2) {
        super();
        this.stacks = healAmount;
        this.isDebuff = false;
        this.imageName = "leech";
    }

    override getDisplayName(): string {
        return "Leeching Bite";
    }

    override getDescription(): string {
        return `When this enemy deals damage, it heals ${this.getStacksDisplayText()} HP.`;
    }

    override onOwnerStriking_CannotModifyDamage(struckUnit: BaseCharacter, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void {
        const owner = this.getOwnerAsCharacter();
        if (owner && damageInfo.unblockedDamageTaken > 0) {
            ActionManager.getInstance().heal(owner, this.stacks);
        }
    }
}
