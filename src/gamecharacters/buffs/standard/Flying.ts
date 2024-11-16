import { DamageInfo } from "../../../rules/DamageInfo";
import { IBaseCharacter } from "../../IBaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class Flying extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.secondaryStacks = stacks; // Used to track remaining dodges this turn
        this.showSecondaryStacks = true;
    }

    override getName(): string {
        return "Flying";
    }

    override getDescription(): string {
        return `Dodges the first ${this.getStacksDisplayText()} attacks each turn.`;
    }

    override onTurnStart(): void {
        this.secondaryStacks = this.stacks; // Reset dodges at the start of each turn
    }

    override getCombatDamageTakenModifier(sourceCharacter?: IBaseCharacter, sourceCard?: PlayableCard): number {
        if (this.secondaryStacks > 0) {
            console.log(`Flying buff activated. Dodged attack. Remaining dodges this turn: ${this.secondaryStacks}`);
            return -1000;
        }
        return 0; // No modification if no dodges left
    }

    override onOwnerStruck_CannotModifyDamage(strikingUnit: IBaseCharacter | null, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void {
        this.secondaryStacks --;    
    }
}
