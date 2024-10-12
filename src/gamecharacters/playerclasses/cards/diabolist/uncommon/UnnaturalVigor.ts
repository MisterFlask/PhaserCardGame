import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BloodPriceBuff } from "../../../../buffs/standard/Bloodprice";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class UnnaturalVigor extends PlayableCard {
    constructor() {
        super({
            name: "Unnatural Vigor",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.UNCOMMON,
        });
        this.energyCost = 2;
        this.baseMagicNumber = 4; // Iron
    }

    override get description(): string {
        return `All cards in hand gain Bloodprice 4. Gain ${this.getDisplayedMagicNumber()} Iron.`; 
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Apply Bloodprice buff to all cards in hand
        combatState.currentHand.forEach(card => {
            card.buffs.push(new BloodPriceBuff(4));
        });

        this.actionManager.modifyIron(this.getBaseMagicNumberAfterResourceScaling());
    }

    override OnPurchase(): void {
        // Logic for when the card is purchased, if needed
    }
}
