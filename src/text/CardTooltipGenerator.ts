import { AbstractCard } from "../gamecharacters/AbstractCard";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { ActionManagerFetcher } from "../utils/ActionManagerFetcher";
import { MagicWords } from "./MagicWords";

export class CardTooltipGenerator {
    private static instance: CardTooltipGenerator;

    private constructor() {}

    public static getInstance(): CardTooltipGenerator {
        if (!CardTooltipGenerator.instance) {
            CardTooltipGenerator.instance = new CardTooltipGenerator();
        }
        return CardTooltipGenerator.instance;
    }

    public generateTooltip(card: AbstractCard): string {
        if (!ActionManagerFetcher.isInitialized()) {
            return "ACTION MANAGER FETCHER NOT INITIALIZED"
        }

        let tooltip = "";

        var entityDisplayName = "Card";
        if (card.isBaseCharacter()) {
            entityDisplayName = "Character";
        }
        // Add any buffs the card has
        if (card.buffs.length > 0) {
            tooltip += `\n[color=cyan]${entityDisplayName} Buffs:[/color]\n`;
            for (const buff of card.buffs) {
                let parenthetical = "";
                if (buff.isPersonaTrait) {
                    parenthetical = `[color=yellow](Permanent)[/color]`;
                }else if (buff.isPersistentBetweenCombats){
                    parenthetical = `[color=yellow](Until End Of Run)[/color]`;
                }
                tooltip += `-[color=cyan] ${buff.getName()}[/color] ${parenthetical}: ${buff.getDescription()}\n`;
            }
        }


        // Add resource scaling information if card has any
        if (card.isPlayableCard()) {
            const playableCard = card as PlayableCard;
            if (playableCard.resourceScalings.length > 0) {
                tooltip += "\n[color=cyan]Resource Scaling:[/color]\n";
                for (const scaling of playableCard.resourceScalings) {
                    let resourceNameText = scaling.resource.glyph ?? scaling.resource.name;
                    if (scaling.attackScaling) {
                        tooltip += `- [color=red]Damage[/color] scaling: ${scaling.attackScaling} x ${resourceNameText}\n`;
                    }
                    if (scaling.blockScaling) {
                        tooltip += `- [color=cyan]Block[/color] scaling: ${scaling.blockScaling} x ${resourceNameText}\n`; 
                    }
                    if (scaling.magicNumberScaling) {
                        tooltip += `- [color=lightgreen]Effect[/color] scaling: ${scaling.magicNumberScaling} x ${resourceNameText}\n`;
                    }
                }
            }
        }
        
        // Add description with magic words highlighted
        const magicWordsResult = MagicWords.getInstance().getMagicWordsResult(card.description);
        magicWordsResult.buffs = magicWordsResult.buffs.filter(buff => 
            !card.buffs.some(existingBuff => existingBuff.constructor === buff.constructor)
        );

        if (magicWordsResult.buffs.length > 0) {
            // Add card name
            tooltip += `[color=gold]Reference:[/color]\n`;
            for (const buff of magicWordsResult.buffs) {
                tooltip += `- [color=yellow][b]${buff.getName()}[/b][/color] ${buff.getDescription()}\n`;
            }
        }

        // do the same for cards
        if (magicWordsResult.cards.length > 0) {
            tooltip += `[color=gold]Reference:[/color]\n`;
            for (const card of magicWordsResult.cards) {
                tooltip += `- [color=yellow][b]${card.name}[/b][/color] ${card.description}\n`;
            }
        }

        return tooltip;
    }
}
