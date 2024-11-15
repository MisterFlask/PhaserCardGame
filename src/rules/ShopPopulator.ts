import { PlayableCard } from '../gamecharacters/PlayableCard';
import { CardLibrary } from '../gamecharacters/playerclasses/cards/CardLibrary';
import { AbstractRelic } from '../relics/AbstractRelic';
import { RelicsLibrary } from '../relics/RelicsLibrary';
import { GameState } from './GameState';

export interface ShopItem {
    card?: PlayableCard;
    relic?: AbstractRelic;
    price: number;
}

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

    private getRandomCards(count: number): PlayableCard[] {        
        const gameState = GameState.getInstance();
        const availableCards = gameState.combatState.playerCharacters
            .flatMap(character => CardLibrary.getInstance()
                .getCardsForClass(character.characterClass))
            .sort(() => Math.random() - 0.5);
        return availableCards.slice(0, count);
    }

    public getShopItems(): ShopItem[] {
        const items: ShopItem[] = [];
        
        const cards = this.getRandomCards(ShopPopulator.NUM_CARDS_PER_SHOP);
        cards.forEach(card => {
            items.push({
                card: card.Copy(),
                price: this.getCardPrice(card)
            });
        });

        const relics = RelicsLibrary.getInstance().getRandomRelics(ShopPopulator.NUM_RELICS_PER_SHOP);
        relics.forEach(relic => {
            items.push({
                relic: relic,
                price: this.getRelicPrice(relic)
            });
        });

        return items;
    }
}
