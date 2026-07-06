import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { AbstractConsumable } from "./AbstractConsumable";

export class FieldSurgeonsKit extends AbstractConsumable {
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
        return "Field Surgeon's Kit";
    }

    override getDescription(): string {
        return `Heal ${this.healAmount} HP.`;
    }

    getTooltip(): string {
        return `${this.getDescription()}\n[i]Carbolic, catgut, and a hip flask of something stronger than either. Company-approved, if barely.[/i]`;
    }

    override onUse(target: BaseCharacter): boolean {
        // Can only use on living characters
        if (!target || target.isDead()) {
            return false;
        }

        this.actionManager.DoAThing("Use Field Surgeon's Kit", () => {
            this.actionManager.heal(target, this.healAmount);
        });

        return true;
    }

    override onPurchase(): void {
        console.log("Field Surgeon's Kit purchased!");
    }
}