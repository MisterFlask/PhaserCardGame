import { AbstractRelic } from "../relics/AbstractRelic";
import { ActionManagerFetcher } from "../utils/ActionManagerFetcher";
import { MagicWords } from "./MagicWords";

export class RelicTooltipGenerator {
    private static instance: RelicTooltipGenerator;

    private constructor() {}

    public static getInstance(): RelicTooltipGenerator {
        if (!RelicTooltipGenerator.instance) {
            RelicTooltipGenerator.instance = new RelicTooltipGenerator();
        }
        return RelicTooltipGenerator.instance;
    }

    public generateTooltip(relic: AbstractRelic): string {
        if (!ActionManagerFetcher.isInitialized()) {
            return "ACTION MANAGER FETCHER NOT INITIALIZED"
        }

        let tooltip = "";

        // Add relic name
        tooltip += `[color=gold]${relic.getDisplayName()}[/color]\n\n`;

        // Add description with magic words highlighted
        const magicWordsResult = MagicWords.getInstance().getMagicWordsResult(relic.getDescription());

        // Add the description
        tooltip += relic.getDescription() + "\n";

        // Add referenced buffs
        if (magicWordsResult.buffs.length > 0) {
            tooltip += `\n[color=gold]Reference:[/color]\n`;
            for (const buff of magicWordsResult.buffs) {
                tooltip += `- [color=yellow][b]${buff.getDisplayName()}[/b][/color] ${buff.getDescription()}\n`;
            }
        }

        // Add referenced cards
        if (magicWordsResult.cards.length > 0) {
            tooltip += `\n[color=gold]Reference:[/color]\n`;
            for (const card of magicWordsResult.cards) {
                tooltip += `- [color=yellow][b]${card.name}[/b][/color] ${card.description}\n`;
            }
        }

        // Add surface sell value if it exists and is not 0
        if (relic.surfaceSellValue > 0) {
            tooltip += `\n[color=gold]Export Value: ${relic.surfaceSellValue}[/color]`;
        }

        return tooltip;
    }
}
