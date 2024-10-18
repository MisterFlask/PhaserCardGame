import { PlayableCard } from '../gamecharacters/PlayableCard';
import { Rummage } from '../gamecharacters/playerclasses/cards/basic/Rummage';

interface ShopItem {
    card: PlayableCard;
    price: number;
}

export class ShopPopulator {
    private static instance: ShopPopulator;
    private constructor() {}

    public static getInstance(): ShopPopulator {
        if (!ShopPopulator.instance) {
            ShopPopulator.instance = new ShopPopulator();
        }
        return ShopPopulator.instance;
    }

    public getShopItems(): ShopItem[] {
        // This is a placeholder implementation. In a real scenario, you'd want to
        // dynamically generate this list based on game state, player progress, etc.
        return [
            
            { card: new Rummage(), price: 50 },
            { card: new Rummage(), price: 50 },
            { card: new Rummage(), price: 50 },
        ];
    }
}
