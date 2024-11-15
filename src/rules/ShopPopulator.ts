import { PlayableCard } from '../gamecharacters/PlayableCard';
import { CardLibrary } from '../gamecharacters/playerclasses/cards/CardLibrary';
import { AbstractRelic } from '../relics/AbstractRelic';
import { RelicsLibrary } from '../relics/RelicsLibrary';
import { GameState } from './GameState';

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
        
        return Math.floor(basePrice );
    }

    private getRelicPrice(relic: AbstractRelic): number {
        
        return Math.floor(relic.rarity.basePrice);
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

    public getShopCards(): PlayableCard[] {
        const cards = this.getRandomCardsFromPlayerCharacterCardPools(ShopPopulator.NUM_CARDS_PER_SHOP);
        
        return cards;
    }

    public getShopRelics(): AbstractRelic[] {
        const items: AbstractRelic[] = [];
        const relics = RelicsLibrary.getInstance().getRandomRelics(ShopPopulator.NUM_RELICS_PER_SHOP);
        relics.forEach(relic => {
            items.push(relic);
        });
        return items;
    }
}
