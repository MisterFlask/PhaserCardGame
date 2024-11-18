import { GameState } from "../../../rules/GameState";
import { CardType } from "../../Primitives";
import { AbstractBuff } from "../AbstractBuff";
import { HellSellValue } from "../standard/HellSellValue";

export class Merchant extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getName(): string {
        return "Merchant";
    }

    override getDescription(): string {
        return `At the start of your run, a random piece of cargo in your inventory sells for ${this.getStacksDisplayText()} more Hell Currency.`;
    }

    override onRunStart(): void {
        const cards = GameState.getInstance().masterDeckAllCharacters
        
        // Filter for cargo cards
        const cargoCards = cards.filter(card => card.cardType === CardType.ITEM);

        
        if (cargoCards.length > 0) {
            // Select a random cargo card
            const randomCargoCard = cargoCards[Math.floor(Math.random() * cargoCards.length)];
            // Increase sell value
            this.actionManager.applyBuffToCard(randomCargoCard, new HellSellValue(this.stacks));
        }
    }
}
