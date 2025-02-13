import { SurfaceSellValue } from '../gamecharacters/buffs/standard/SurfaceSellValue';
import { PlayableCard } from '../gamecharacters/PlayableCard';
import { CardLibrary } from '../gamecharacters/playerclasses/cards/CardLibrary';
import { AbstractRelic } from '../relics/AbstractRelic';
import { RelicsLibrary } from '../relics/RelicsLibrary';
import { GameState } from './GameState';
import { ModifierContext } from './modifiers/AbstractCardModifier';
import { CardModifierRegistry } from './modifiers/CardModifierRegistry';

export class ShopPopulator {
    private static instance: ShopPopulator;
    
    private constructor() {}

    public static readonly NUM_CARDS_PER_SHOP = 8;
    public static readonly NUM_RELICS_PER_SHOP = 8;

    public static getInstance(): ShopPopulator {
        if (!ShopPopulator.instance) {
            ShopPopulator.instance = new ShopPopulator();
        }
        return ShopPopulator.instance;
    }

    private getCardPrice(card: PlayableCard): number {
        const basePrice = card.rarity.basePrice;
        const randomMultiplier = 0.8 + Math.random() * 0.4; // Random number between 0.8 and 1.2
        var price = Math.floor(basePrice * randomMultiplier);
        // Apply any price modifiers from buffs
        card.buffs.forEach(buff => {
            price *= ( 1 + buff.purchasePricePercentModifier() / 100);
        });
        return Math.floor(price);
    }
    private generateRandomCardModificationIfAny(card: PlayableCard) {
        const registry = CardModifierRegistry.getInstance();
        
        // First try positive modifiers (30% chance)
        if (Math.random() < 0.3) {
            const positiveModifiers = registry.positiveModifiers
                .filter(mod => mod.isApplicableInContext(ModifierContext.SHOP))
                .filter(mod => mod.eligible(card));

            if (positiveModifiers.length > 0) {
                const totalProb = positiveModifiers.reduce((sum, mod) => sum + (mod.probability ?? 1), 0);
                const r = Math.random() * totalProb;
                let cumulative = 0;
                for (const mod of positiveModifiers) {
                    cumulative += mod.probability ?? 1;
                    if (r < cumulative) {
                        mod.applyModification(card);
                        return;
                    }
                }
            }
        }

        // Then try negative modifiers
        const negativeModifiers = registry.negativeModifiers
            .filter(mod => mod.isApplicableInContext(ModifierContext.SHOP))
            .filter(mod => mod.eligible(card));
    
        if (negativeModifiers.length === 0) return;
    
        const totalProb = negativeModifiers.reduce((sum, mod) => sum + (mod.probability ?? 0), 0);
        const r = Math.random() * totalProb;
        let cumulative = 0;
        for (const mod of negativeModifiers) {
            cumulative += mod.probability ?? 0;
            if (r < cumulative) {
                mod.applyModification(card);
                break;
            }
        }
    }
    

    private getRelicPrice(relic: AbstractRelic): number {
        var basePrice = Math.floor(relic.rarity.basePrice);
        const randomMultiplier = 0.8 + Math.random() * 0.4; // Random number between 0.8 and 1.2
        basePrice = Math.floor(basePrice * randomMultiplier);
        return basePrice;
    }

    private getRandomCardsFromPlayerCharacterCardPools(count: number): PlayableCard[] {        
        const gameState = GameState.getInstance();

        if (gameState.currentRunCharacters.length === 0) {
            console.error('No characters in current run when attempting to populate shop cards');
        }
        const availableCards = gameState.currentRunCharacters
            .flatMap(character => CardLibrary.getInstance()
                .getCardsForClass(character.characterClass))
            .sort(() => Math.random() - 0.5);
        return availableCards.slice(0, count);
    }

    public getCombatShopCards(): PlayableCard[] {
        const cards = this.getRandomCardsFromPlayerCharacterCardPools(ShopPopulator.NUM_CARDS_PER_SHOP);
        cards.forEach(card => {
            this.generateRandomCardModificationIfAny(card);
            card.hellPurchaseValue = this.getCardPrice(card);
        });
        return cards;
    }

    public getCombatShopRelics(): AbstractRelic[] {
        const items: AbstractRelic[] = [];
        const relics = RelicsLibrary.getInstance().getRandomBeneficialRelics(ShopPopulator.NUM_RELICS_PER_SHOP);
        relics.forEach(relic => {
            items.push(relic);
            relic.price = this.getRelicPrice(relic);
        });
        return items;
    }

    public getCursedGoodsCards(): PlayableCard[]{
        // take a random 2 cards from the relics library
        const cards = RelicsLibrary.getInstance().getRandomCursedCards(ShopPopulator.NUM_CARDS_PER_SHOP);
        cards.forEach(card => {
            card.applyBuffs_useFromActionManager([new SurfaceSellValue(Math.floor(Math.random() * 200) + 1)])
            card.hellPurchaseValue = Math.floor(this.getCardPrice(card) / 2);
        });
        return cards;
    }

    public getCursedGoodsRelics(): AbstractRelic[] {
        const relics = RelicsLibrary.getInstance().getRandomCursedRelics(ShopPopulator.NUM_RELICS_PER_SHOP);
        relics.forEach(relic => {
            relic.price = Math.floor(this.getRelicPrice(relic) / 2);
            relic.surfaceSellValue = Math.floor(Math.random() * 200) + 1;
        });
        return relics;
    }
}


