import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { GameState } from "../rules/GameState";
import { AbstractConsumable } from "./AbstractConsumable";

export class SovereignsPurse extends AbstractConsumable {
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
        return "Sovereign's Purse";
    }

    override getDescription(): string {
        return `Gain ${this.ventureAmount} Venture.`;
    }

    getTooltip(): string {
        return `${this.getDescription()}\n[i]A drawstring purse of pre-signed letters of credit. Spends the same as gold, weighs considerably less on the conscience.[/i]`;
    }

    override onUse(target: BaseCharacter): boolean {
        const gameState = GameState.getInstance();
        this.actionManager.DoAThing("Apply Sovereign's Purse", () => {
            this.actionManager.modifyVenture(this.ventureAmount);
        });
        return true;
    }

    override onPurchase(): void {
        console.log("Sovereign's Purse purchased!");
    }
}