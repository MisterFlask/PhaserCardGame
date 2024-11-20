import { GameState } from '../../../rules/GameState';
import { BaseCharacterClass } from '../../BaseCharacterClass';
import { EntityRarity, PlayableCard } from '../../PlayableCard';
import { ArchonClass } from '../ArchonClass';
import { BlackhandClass } from '../BlackhandClass';
import { DiabolistClass } from '../DiabolistClass';

export class CardLibrary {
    private static instance: CardLibrary;

    private constructor() {

    }

    public static getInstance(): CardLibrary {
        if (!CardLibrary.instance) {
            CardLibrary.instance = new CardLibrary();
        }
        return CardLibrary.instance;
    }

    public getCharacterClasses(): BaseCharacterClass[] {
        var classes = [
            new BlackhandClass(),
            new DiabolistClass(),
            new ArchonClass(),
        ];

        for (var c of classes) {
            c.initialize();
        }

        return classes;
    }
    public getCardsForClassesRelevantToThisRun(): PlayableCard[] {
        var characters = GameState.getInstance().currentRunCharacters;
        var cards = characters.flatMap(c => c.characterClass.availableCards);
        // Make sure we're copying each card before deduping to avoid any reference issues
        const cardCopies = cards.map(card => card.Copy());
        // dedupe
        return [...new Map(cardCopies.map(item => [item.name, item])).values()];
    }
    public getRandomSelectionOfRelevantClassCards(count: number, rarity?: EntityRarity): PlayableCard[] {
        var cards = this.getCardsForClassesRelevantToThisRun();
        if (rarity) {
            cards = cards.filter(card => card.rarity === rarity);
        }
        return cards.sort(() => Math.random() - 0.5).slice(0, count);
    }

    public getCardsForClass(characterClass: BaseCharacterClass): PlayableCard[] {
        return characterClass.availableCards.map(c => c.Copy());
    }

    public getAllCards(): PlayableCard[] {
        return [
            ... this.getCharacterClasses().flatMap(c => c.availableCards)
            .map(c => c.Copy()),
        ];
    }
}
