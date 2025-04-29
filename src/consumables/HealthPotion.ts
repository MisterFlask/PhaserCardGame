import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { AbstractConsumable } from "./AbstractConsumable";

export class HealthPotion extends AbstractConsumable {
    private healAmount: number = 10;

    constructor() {
        super();
        this.targetingType = TargetingType.ALLY;
        this.rarity = EntityRarity.COMMON;
        this.basePrice = 75;
        this.uses = 1;
        this.tint = 0xFF5555; // Red tint for health potion
    }

    override getDisplayName(): string {
        return "Health Potion";
    }

    override getDescription(): string {
        return `Restore ${this.healAmount} health to target ally.`;
    }

    override onUse(target: BaseCharacter): boolean {
        // Can only use on living characters
        if (!target || target.isDead()) {
            return false;
        }

        // Heal the target
        this.actionManager.DoAThing("Use Health Potion", () => {
            this.actionManager.heal(target, this.healAmount);
        });

        return true;
    }

    override onPurchase(): void {
        // Could implement special effects when purchased
        console.log("Health Potion purchased!");
    }
} 