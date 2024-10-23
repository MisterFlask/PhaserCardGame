// Power: Manufacture an Eldritch Smoke to your hand.  Draw 2 cards.  Cost 2.  Whenever you Sacrifice, manufacture an Eldritch Smoke to your hand.

import { DeckLogic } from "../../../../../rules/DeckLogic";
import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";
import { EldritchSmoke } from "../tokens/EldritchSmoke";


export class ObsidianCandles extends PlayableCard {
    constructor() {
        super({
            name: "Obsidian Candles",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.COMMON,
        });
        this.energyCost = 1;
        this.baseMagicNumber = 1; // Draw 1 card instead of 2
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Manufacture an Eldritch Smoke to your hand
        BasicProcs.getInstance().ManufactureCardToHand(new EldritchSmoke());

        // Draw 2 cards
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;
        const deckLogic = DeckLogic.getInstance();
        deckLogic.drawCards(2);

    }

    override get description(): string {
        return `Manufacture an "Eldritch Smoke" to your hand. Draw 2 cards. Whenever you Sacrifice, manufacture an "Eldritch Smoke" to your hand.`;
    }

    override OnPurchase(): void {
        // Logic for when the card is purchased, if needed
    }
}
