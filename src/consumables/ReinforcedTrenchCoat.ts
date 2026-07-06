import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { AbstractConsumable } from "./AbstractConsumable";

export class ReinforcedTrenchCoat extends AbstractConsumable {
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
        return "Reinforced Trench Coat";
    }

    override getDescription(): string {
        return `Apply ${this.blockAmount} block.`;
    }

    getTooltip(): string {
        return `${this.getDescription()}\n[i]Waxed canvas over demon-hide plate. Standard issue, once you know which quartermaster to ask.[/i]`;
    }

    override onUse(target: BaseCharacter): boolean {
        // Can only use on living characters
        if (!target || target.isDead()) {
            return false;
        }

        this.actionManager.DoAThing("Use Reinforced Trench Coat", () => {
            target.block += this.blockAmount;
        });

        return true;
    }

    override onPurchase(): void {
        console.log("Reinforced Trench Coat purchased!");
    }
}