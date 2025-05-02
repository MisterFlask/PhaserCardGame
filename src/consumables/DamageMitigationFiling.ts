import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { AbstractConsumable } from "./AbstractConsumable";

export class DamageMitigationFiling extends AbstractConsumable {
    private blockAmount: number = 12;

    constructor() {
        super();
        this.targetingType = TargetingType.ALLY;
        this.rarity = EntityRarity.COMMON;
        this.basePrice = 100;
        this.uses = 1;
        this.tint = 0x0000FF; // Blue tint for block
    }

    override getDisplayName(): string {
        return "Form 404-z: Damage Mitigation Filing";
    }

    override getDescription(): string {
        return `Apply ${this.blockAmount} block.`;
    }

    override onUse(target: BaseCharacter): boolean {
        // Can only use on living characters
        if (!target || target.isDead()) {
            return false;
        }

        this.actionManager.DoAThing("Use Damage Mitigation Filing", () => {
            target.block += this.blockAmount;
        });

        return true;
    }

    override onPurchase(): void {
        console.log("Damage Mitigation Filing purchased!");
    }
} 