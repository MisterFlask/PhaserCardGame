import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { GameState } from "../rules/GameState";
import { AbstractConsumable } from "./AbstractConsumable";

export class VentureCapitalAuthorization extends AbstractConsumable {
    private ventureAmount: number = 2;

    constructor() {
        super();
        this.targetingType = TargetingType.NO_TARGETING; // Not directly usable
        this.rarity = EntityRarity.UNCOMMON;
        this.basePrice = 200;
        this.uses = 1;
        this.tint = 0x00FF00; // Green tint for venture theme
    }

    override getDisplayName(): string {
        return "Form 10-g: Venture Capital Authorization";
    }

    override getDescription(): string {
        return `Gain ${this.ventureAmount} Venture.`;
    }

    override onUse(target: BaseCharacter): boolean {
        const gameState = GameState.getInstance();
        this.actionManager.DoAThing("Apply Venture Capital Authorization", () => {
            this.actionManager.modifyVenture(this.ventureAmount);
        });
        return true;
    }

    override onPurchase(): void {
        console.log("Venture Capital Authorization purchased!");
    }
} 