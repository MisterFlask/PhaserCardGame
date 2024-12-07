import { AbstractBuff } from '../gamecharacters/buffs/AbstractBuff';
import { Heavy } from '../gamecharacters/buffs/playable_card/Heavy';
import { Damaged } from '../gamecharacters/buffs/playable_card/SaleTags/Damaged';
import { OnSale } from '../gamecharacters/buffs/playable_card/SaleTags/OnSale';
import { BloodPriceBuff } from '../gamecharacters/buffs/standard/Bloodprice';
import { IncreaseBlood } from '../gamecharacters/buffs/standard/combatresource/IncreaseBlood';
import { IncreaseIron } from '../gamecharacters/buffs/standard/combatresource/IncreaseMetal';
import { IncreasePluck } from '../gamecharacters/buffs/standard/combatresource/IncreasePluck';
import { IncreaseSmog } from '../gamecharacters/buffs/standard/combatresource/IncreaseSmog';
import { IncreaseVenture } from '../gamecharacters/buffs/standard/combatresource/IncreaseVenture';
import { Lethality } from '../gamecharacters/buffs/standard/Strong';
import { EntityRarity, PlayableCard } from '../gamecharacters/PlayableCard';
import { Rummage } from '../gamecharacters/playerclasses/cards/basic/Rummage';
import { CardLibrary } from '../gamecharacters/playerclasses/cards/CardLibrary';
import { AbstractRelic } from '../relics/AbstractRelic';
import { RelicsLibrary } from '../relics/RelicsLibrary';
import { GameState } from './GameState';

export class ShopCardModifier {
    constructor(
        public probability: number,
        public modifier: (card: PlayableCard) => void,
        public requires: (card: PlayableCard) => boolean = () => true
    ) {}
}

const modifiers: ShopCardModifier[] = [
    new ShopCardModifier(0.2, (card: PlayableCard) => {
        card.applyBuffs_useFromActionManager([new Damaged(1)]);
        card.applyBuffs_useFromActionManager([new OnSale(90)]);
        card.name += "?";
    }, (card: PlayableCard) => card.rarity.isAtLeastAsRareAs(EntityRarity.RARE)),
    new ShopCardModifier(0.2, (card: PlayableCard) => {
        card.applyBuffs_useFromActionManager([new OnSale(50)]);
    }),
    new ShopCardModifier(0.2, (card: PlayableCard) => {
        card.applyBuffs_useFromActionManager([getRandomEnhancementBuff()]);
        card.name += "+";
    }),
    new ShopCardModifier(0.2, (card: PlayableCard) => {
        card.applyBuffs_useFromActionManager([new Heavy()]);
        card.applyBuffs_useFromActionManager([new OnSale(90)]);
        card.name += "?";
    }, (card: PlayableCard) => card.rarity.isAtLeastAsRareAs(EntityRarity.UNCOMMON))
];

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

    private generateRandomCardModificationIfAny(card: PlayableCard){
        for (const modifier of modifiers) {
            if (modifier.requires(card) && Math.random() < modifier.probability) {
                modifier.modifier(card);
                return;
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
        const relics = RelicsLibrary.getInstance().getRandomRelics(ShopPopulator.NUM_RELICS_PER_SHOP);
        relics.forEach(relic => {
            items.push(relic);
            relic.price = this.getRelicPrice(relic);
        });
        return items;
    }

    public getCursedGoodsCards(): PlayableCard[]{
        return [new Rummage()]; //todo: add more cursed goods cards
    }
}
function getRandomEnhancementBuff(): AbstractBuff {
    var buffs = [
        new Lethality(1),
        new IncreaseIron(),
        // new IncreasePages(),
        new IncreasePluck(1),
        new IncreaseBlood(),
        new IncreaseSmog(),
        new IncreaseVenture(),

        new BloodPriceBuff(3)
    ]
    return buffs[Math.floor(Math.random() * buffs.length)];
}


