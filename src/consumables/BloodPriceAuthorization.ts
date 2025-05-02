import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { BloodPriceBuff } from "../gamecharacters/buffs/standard/Bloodprice";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { GameState } from "../rules/GameState";
import { AbstractConsumable } from "./AbstractConsumable";

export class BloodPriceAuthorization extends AbstractConsumable {
    private bloodpriceAmount: number = 2;

    constructor() {
        super();
        this.targetingType = TargetingType.NO_TARGETING; // Not directly usable
        this.rarity = EntityRarity.UNCOMMON;
        this.basePrice = 200;
        this.uses = 1;
        this.tint = 0xFF0000; // Red tint for blood theme
    }

    override getDisplayName(): string {
        return "Form 8-e: Blood Price Authorization";
    }

    override getDescription(): string {
        return `All cards in hand gain Bloodprice (${this.bloodpriceAmount}).`;
    }

    override onUse(target: BaseCharacter): boolean {
        const gameState = GameState.getInstance();
        this.actionManager.DoAThing("Apply Blood Price Authorization", () => {
            gameState.combatState.currentHand.forEach((card: PlayableCard) => {
                // Only add Bloodprice if the card doesn't already have it
                if (!card.buffs.some((buff: AbstractBuff) => buff instanceof BloodPriceBuff)) {
                    this.actionManager.applyBuffToCharacterOrCard(card, new BloodPriceBuff(this.bloodpriceAmount));
                }
            });
        });
        return true;
    }

    override onPurchase(): void {
        console.log("Blood Price Authorization purchased!");
    }
} 