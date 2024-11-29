import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";
import { Stress } from "../standard/Stress";

export class FearEater extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Fear Eater";
    }

    override getDescription(): string {
        return `Damage is increased by ${this.getStacksDisplayText()} times the stress of the target.`;
    }

    override getCombatDamageDealtModifier(target: BaseCharacter): number {
        const stressBuff = target.buffs.find(buff => buff instanceof Stress);
        const stressLevel = stressBuff ? stressBuff.stacks : 0;
        return this.stacks * stressLevel;
    }
}
