import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { Lethality } from "../gamecharacters/buffs/standard/Lethality";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { AbstractConsumable } from "./AbstractConsumable";

export class StrengthElixir extends AbstractConsumable {
    private strengthAmount: number = 2;
    
    constructor() {
        super();
        this.targetingType = TargetingType.ALLY;
        this.rarity = EntityRarity.UNCOMMON;
        this.basePrice = 125;
        this.uses = 2; // Can be used twice in a combat
        this.imageName = "strength_elixir"; // Assuming this texture exists
        this.tint = 0xCC3300; // Orange-red tint for strength
    }

    override getDisplayName(): string {
        return "Strength Elixir";
    }

    override getDescription(): string {
        return `Grant ${this.strengthAmount} Lethality to target ally. 
Can be used ${this.uses} times per combat.`;
    }

    override onUse(target: BaseCharacter): boolean {
        // Can only use on living characters
        if (!target || target.isDead()) {
            return false;
        }

        // Apply Lethality buff to the target
        this.actionManager.DoAThing("Use Strength Elixir", () => {
            this.actionManager.applyBuffToCharacterOrCard(target, new Lethality(this.strengthAmount));
        });

        return true;
    }

    override onPurchase(): void {
        console.log("Strength Elixir purchased!");
    }
} 