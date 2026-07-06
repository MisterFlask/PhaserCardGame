import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { AbstractConsumable } from "./AbstractConsumable";

export class AdrenalineCharge extends AbstractConsumable {
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
        return "Adrenaline Charge";
    }

    override getDescription(): string {
        return `Gain ${this.energyAmount} energy immediately.`;
    }

    getTooltip(): string {
        return `${this.getDescription()}\n[i]Spring-loaded injector, single dose. The Company's physicians disavow it; the Company's timesheets encourage it.[/i]`;
    }

    override onUse(target: BaseCharacter): boolean {
        // No target needed for this consumable
        this.actionManager.DoAThing("Use Adrenaline Charge", () => {
            this.actionManager.gainEnergy(this.energyAmount);
        });

        return true;
    }

    override onPurchase(): void {
        console.log("Adrenaline Charge purchased!");
    }
}