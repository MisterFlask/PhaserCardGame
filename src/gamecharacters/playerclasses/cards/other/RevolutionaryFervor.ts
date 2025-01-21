import { DeckLogic, PileName } from "../../../../rules/DeckLogicHelper";
import { GameState } from "../../../../rules/GameState";
import { TargetingType } from "../../../AbstractCard";
import { EntityRarity, PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";
import { BalefireRevolver } from "./BalefireRevolver";

export class RevolutionaryFervor extends PlayableCard {
    constructor() {
        super({
            name: "Revolutionary Fervor",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.baseMagicNumber = 3; // Number of cards to draw
    }

    override get description(): string {
        return `Draw ${this.getDisplayedMagicNumber()} cards. Transform all Fire Revolvers in your deck into Balefire Revolvers.`;
    }

    override InvokeCardEffects(): void {
        // Draw cards
        this.actionManager.drawCards(this.getBaseMagicNumberAfterResourceScaling());

        // Get all piles
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;
        const allPiles = [
            ...combatState.drawPile,
            ...combatState.currentDiscardPile,
            ...combatState.currentHand,
        ];

        // Transform all Fire Revolvers into Balefire Revolvers
        allPiles.forEach(card => {
            if (card.name === "Fire Revolver") {
                // Move the card to exhaust (effectively removing it)
                DeckLogic.moveCardToPile(card, PileName.Exhaust);

                // Create new Balefire Revolver and add it to the draw pile
                const newCard = new BalefireRevolver();
                DeckLogic.moveCardToPile(newCard, PileName.Draw);
            }
        });
    }
} 