import { DamageInfo } from "../../../rules/DamageInfo";
import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class Intangible extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.imageName = "intangible";
    }

    override getDisplayName(): string {
        return "Intangible";
    }

    override getDescription(): string {
        return `Take 1 damage from all sources.`;
    }

    override onOwnerStruck_CannotModifyDamage(strikingUnit: BaseCharacter | null, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void {
        // Set damage to 1
        damageInfo.unblockedDamageTaken = 1;
    }

    override onTurnEnd(): void {
        // Remove the buff at end of turn
        this.stacks = 0;
    }
} 