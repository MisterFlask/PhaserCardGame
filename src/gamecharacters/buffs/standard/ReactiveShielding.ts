import { DamageInfo } from "../../../rules/DamageInfo";
import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class ReactiveShielding extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.secondaryStacks = 0;
        this.showSecondaryStacks = false;
    }

    override getName(): string {
        return "Reactive Shielding";
    }

    override getDescription(): string {
        return `After taking unblocked damage for the first time in a turn, gain ${this.getStacksDisplayText()} Block.`;
    }

    override onOwnerStruck_CannotModifyDamage(strikingUnit: BaseCharacter | null, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void {
        if (this.secondaryStacks === 0 && damageInfo.unblockedDamageTaken > 0) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                this.actionManager.applyBlock({baseBlockValue: this.stacks, blockSourceCharacter: owner});
                this.secondaryStacks = 1; // Mark that the effect has triggered this turn
            }
        }
    }

    override onTurnStart(): void {
        this.secondaryStacks = 0; // Reset the trigger at the start of each turn
    }
}
