import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { DamageInfo } from "../../../rules/DamageInfo";
import { Poisoned } from "../standard/Poisoned";

export class ToxicRetaliation extends AbstractBuff {
    constructor(stacks: number = 2) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.imageName = "toxic";
    }

    override getDisplayName(): string {
        return "Toxic Retaliation";
    }

    override getDescription(): string {
        return `When struck, apply ${this.getStacksDisplayText()} Poison to the attacker.`;
    }

    override onOwnerStruck_CannotModifyDamage(strikingUnit: BaseCharacter, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void {
        if (strikingUnit) {
            this.actionManager.applyBuffToCharacter(strikingUnit, new Poisoned(this.stacks));
        }
    }
}
