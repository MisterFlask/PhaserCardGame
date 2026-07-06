import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { AbstractConsumable } from "./AbstractConsumable";

export class SignalFlare extends AbstractConsumable {
    private drawAmount: number = 3;

    constructor() {
        super();
        this.targetingType = TargetingType.NO_TARGETING;
        this.rarity = EntityRarity.COMMON;
        this.basePrice = 150;
        this.uses = 1;
        this.tint = 0x00FF00; // Green tint for card draw
    }

    override getDisplayName(): string {
        return "Signal Flare";
    }

    override getDescription(): string {
        return `Draw ${this.drawAmount} cards.`;
    }

    getTooltip(): string {
        return `${this.getDescription()}\n[i]Phosphorus and a prayer. Illuminates the immediate options considerably.[/i]`;
    }

    override onUse(target: BaseCharacter): boolean {
        // No target needed for this consumable
        this.actionManager.DoAThing("Use Signal Flare", () => {
            this.actionManager.drawCards(this.drawAmount);
        });

        return true;
    }

    override onPurchase(): void {
        console.log("Signal Flare purchased!");
    }
}