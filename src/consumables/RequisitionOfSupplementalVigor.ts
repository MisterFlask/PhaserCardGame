import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { AbstractConsumable } from "./AbstractConsumable";

export class RequisitionOfSupplementalVigor extends AbstractConsumable {
    private healAmount: number = 15;

    constructor() {
        super();
        this.targetingType = TargetingType.ALLY;
        this.rarity = EntityRarity.COMMON;
        this.basePrice = 150;
        this.uses = 1;
        this.tint = 0xFF5555; // Red tint for healing
    }

    override getDisplayName(): string {
        return "Form 256-f: Requisition of Supplemental Vigor";
    }

    override getDescription(): string {
        return `Heal ${this.healAmount} HP.`;
    }

    override onUse(target: BaseCharacter): boolean {
        // Can only use on living characters
        if (!target || target.isDead()) {
            return false;
        }

        this.actionManager.DoAThing("Use Requisition of Supplemental Vigor", () => {
            this.actionManager.heal(target, this.healAmount);
        });

        return true;
    }

    override onPurchase(): void {
        console.log("Requisition of Supplemental Vigor purchased!");
    }
} 