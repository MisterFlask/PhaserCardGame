import { PlayableCard } from "../gamecharacters/PlayableCard";
import { CardModifier } from './modifiers/AbstractCardModifier';
import { CardModifierRegistry } from './modifiers/CardModifierRegistry';

export class RestSiteUpgradeOptionManager {
    private static instance: RestSiteUpgradeOptionManager;

    private constructor() {}

    public static getInstance(): RestSiteUpgradeOptionManager {
        if (!RestSiteUpgradeOptionManager.instance) {
            RestSiteUpgradeOptionManager.instance = new RestSiteUpgradeOptionManager();
        }
        return RestSiteUpgradeOptionManager.instance;
    }

    private standardUpgrade = new CardModifier({
        name: "Standard Upgrade",
        modifier: (card: PlayableCard) => card.standardUpgrade(true),
        weight: 1,
        powerLevelChange: 1
    });

    public getRandomSetOfUpgradeOptions(quantityOptions: number): CardModifier[] {
        const options: CardModifier[] = [];
        const registry = CardModifierRegistry.getInstance();

        options.push(this.standardUpgrade);
        
        // Create a pool of available modifiers based on their probabilities
        const modifierPool = [...registry.positiveModifiers];

        // Fisher-Yates shuffle
        for (let i = modifierPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [modifierPool[i], modifierPool[j]] = [modifierPool[j], modifierPool[i]];
        }

        // Add unique modifiers until we reach desired quantity
        let added = 1; // Start at 1 since we already pushed standardUpgrade
        let poolIndex = 0;
        
        while (added < quantityOptions && poolIndex < modifierPool.length) {
            const modifier = modifierPool[poolIndex];
            if (!options.includes(modifier)) {
                options.push(modifier);
                added++;
            }
            poolIndex++;
        }

        return options;
    }
}
