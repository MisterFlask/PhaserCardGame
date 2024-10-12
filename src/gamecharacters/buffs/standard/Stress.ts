import { DamageInfo } from "../../../rules/DamageInfo";
import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class Stress extends AbstractBuff {
    override getName(): string {
        return "Stress";
    }

    override getDescription(): string {
        return `Current stress level: ${this.getStacksDisplayText()}. When stress is above ${this.secondaryStacks}, character receives double damage.`;
    }

    constructor(stacks: number = 0) {
        super();
        this.imageName = "shattered-heart"; // Replace with actual icon name
        this.stacks = stacks;
        this.stackable = true;
        this.isPersistentBetweenCombats = true;
        this.secondaryStacks = 10;
        this.showSecondaryStacks = true;
    }

    override getAdditionalPercentCombatDamageTakenModifier(): number {
        if (this.stacks > 10) {
            return 100;
        } else {
            return 0;
        }
    }
        
    override onOwnerStruck(strikingUnit: BaseCharacter | null, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void {
        if (damageInfo.damageTaken > 0) {
            this.stacks += 1;
            console.log(`${this.getOwnerAsCharacter()?.name}'s stress increased to ${this.stacks}`);
        }
    }
}
