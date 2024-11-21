import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BloodPriceBuff } from "../../../../buffs/standard/Bloodprice";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class BurningSight extends PlayableCard {
    constructor() {
        super({
            name: "Burning Sight",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 2;
        this.buffs.push(new BloodPriceBuff(2));
        this.baseMagicNumber = 3
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Exhaust the top 2 cards of the deck
        for (let i = 0; i < 2; i++) {
            if (combatState.currentDrawPile.length > 0) {
                const cardToExhaust = combatState.currentDrawPile.pop();
                if (cardToExhaust) {
                    this.actionManager.exhaustCard(cardToExhaust as PlayableCard);
                }
            }
        }

        // Gain 3 Pages
        this.actionManager.modifyPages(this.getBaseMagicNumberAfterResourceScaling());
    }

    override get description(): string {
        return `Exhaust the top 2 cards of your deck. Gain 2 Pages.}.`;
    }
}
