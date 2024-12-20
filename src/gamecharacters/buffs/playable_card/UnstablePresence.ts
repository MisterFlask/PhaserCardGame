import { DamageInfo } from "../../../rules/DamageInfo";
import { IBaseCharacter } from "../../IBaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "../standard/Strong";

export class UnstablePresence extends AbstractBuff {
    constructor(stacks: number = 1, secondaryStacks: number = 1) {
        super();
        this.isDebuff = true;
        this.stacks = stacks;
        this.secondaryStacks = secondaryStacks;
    }

    override getDisplayName(): string {
        return "Unstable Presence";
    }

    override getDescription(): string {
        return `Each time this character takes more than ${this.stacks} damage, they receive -${this.stacks} Lethality.`;
    }

    override onOwnerStruck_CannotModifyDamage(strikingUnit: IBaseCharacter | null, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo) {
        if (damageInfo.unblockedDamageTaken > this.stacks) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                this.actionManager.applyBuffToCharacterOrCard(
                    owner,
                    new Lethality(-this.secondaryStacks)
                );
            }
        }
    }
}
