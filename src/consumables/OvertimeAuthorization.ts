import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { AbstractConsumable } from "./AbstractConsumable";

export class OvertimeAuthorization extends AbstractConsumable {
    private energyAmount: number = 2;

    constructor() {
        super();
        this.targetingType = TargetingType.NO_TARGETING;
        this.rarity = EntityRarity.COMMON;
        this.basePrice = 100;
        this.uses = 1;
        this.tint = 0xFFFF00; // Yellow tint for energy
    }

    override getDisplayName(): string {
        return "Form 17-b: Overtime Authorization";
    }

    override getDescription(): string {
        return `Gain ${this.energyAmount} energy immediately.`;
    }

    override onUse(target: BaseCharacter): boolean {
        // No target needed for this consumable
        this.actionManager.DoAThing("Use Overtime Authorization", () => {
            this.actionManager.gainEnergy(this.energyAmount);
        });

        return true;
    }

    override onPurchase(): void {
        console.log("Overtime Authorization purchased!");
    }
} 