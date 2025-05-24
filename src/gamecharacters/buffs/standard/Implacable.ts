import { AbstractBuff } from "../AbstractBuff";
import type { IBaseCharacter } from "../../IBaseCharacter";
import type { PlayableCard } from "../../PlayableCard";
import type { DamageInfo } from "../../../rules/DamageInfo";

export class Implacable extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.stackable = true;
        this.imageName = "skull";
    }

    override getDisplayName(): string {
        return "Implacable";
    }

    override getDescription(): string {
        return `Revives at ¼ HP when killed, ${this.getStacksDisplayText()} trigger(s) left.`;
    }

    override onOwnerStruck_CannotModifyDamage(_strikingUnit: IBaseCharacter | null, _cardPlayedIfAny: PlayableCard | null, _damageInfo: DamageInfo): void {
        const owner = this.getOwnerAsCharacter();
        if (owner && owner.hitpoints <= 0 && this.stacks > 0) {
            owner.hitpoints = Math.ceil(owner.maxHitpoints / 4);
            this.stacks -= 1;
        }
    }
}

