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
                tooltip += `-[color=cyan] ${buff.getName()}[/color]: ${buff.getDescription()}\n`;
            }
        }


        // Add resource scaling information if card has any
        if (card.isPlayableCard()) {
            const playableCard = card as PlayableCard;
            if (playableCard.resourceScalings.length > 0) {
                tooltip += "\n[color=cyan]Resource Scaling:[/color]\n";
                for (const scaling of playableCard.resourceScalings) {
                    let resourceNameText = "[color=magenta]" + scaling.resource.name + "[/color]";
                    if (scaling.attackScaling) {
                        tooltip += `- [color=red]Damage[/color] scaling: ${scaling.attackScaling} * ${resourceNameText}\n`;
                    }
                    if (scaling.blockScaling) {
                        tooltip += `- [color=cyan]Block[/color] scaling: ${scaling.blockScaling} * ${resourceNameText}\n`; 
                    }
                    if (scaling.magicNumberScaling) {
                        tooltip += `- [color=lightgreen]Effect[/color] scaling: ${scaling.magicNumberScaling} * ${resourceNameText}\n`;
                    }
                }
            }
        }
        
        // Add description with magic words highlighted
        const magicWordsResult = MagicWords.getInstance().getMagicWordsResult(card.description);

        if (magicWordsResult.buffs.length > 0) {
            // Add card name
            tooltip += `[color=gold]Reference:[/color]\n`;

            // for each buff in the result, add the description to the tooltip
            for (const buff of magicWordsResult.buffs) {
                buff.helpMode = true;
                tooltip += `- [color=yellow]${buff.getName()}[/color] ${buff.getDescription()}\n`;
            }
        }

        return tooltip;
    }
}
