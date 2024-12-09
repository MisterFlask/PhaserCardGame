import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class BloodPriceBuff extends AbstractBuff {
    constructor(stacks: number) {
        super();
        this.isDebuff = false;
        this.stacks = stacks;
    }

    getDisplayName(): string {
        return "BloodPrice";
    }

    override getDescription(): string {
        return `If you lack sufficient energy, pay ${this.getStacksDisplayText()} health per unpaid energy to play this card.`;
    }

    override canPayThisMuchMissingEnergy(energyNeeded: number): number {
        return 100;
    }


    override provideMissingEnergy_returnsAmountProvided(energyNeeded: number): number {
        console.log("Providing missing energy for Bloodprice, requiring expenditure of " + energyNeeded * this.stacks + " health.");
        this.actionManager.dealDamage(
            {
                baseDamageAmount: energyNeeded * this.stacks, 
                target: this.getOwnerAsPlayableCard()?.owningCharacter as BaseCharacter, 
                fromAttack: false,
                ignoresBlock: true
            });
        return energyNeeded;
    }
}