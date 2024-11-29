import { AbstractCard } from "../gamecharacters/AbstractCard";
import { MagicWords } from "./MagicWords";

export class CardDescriptionGenerator {
    public static generateCardDescription(card: AbstractCard): string {
        if (!card) {
            console.warn('No card data found for description generation');
            return "No card data found for description generation";
        }
        
        // Add any buffs that should be moved to the main description
        let descriptionAdditions = "";
        for (const buff of card.buffs) {
            descriptionAdditions += ` [color=yellow]${buff.getDisplayName()} (${buff.stacks})[/color]. `;
        }
        var baseDescription = card.description;

        if (descriptionAdditions) {
            baseDescription += descriptionAdditions;
        }

        var magicWordsResult = MagicWords.getInstance().getMagicWordsResult(baseDescription);
        return magicWordsResult.stringResult;
    }
}
