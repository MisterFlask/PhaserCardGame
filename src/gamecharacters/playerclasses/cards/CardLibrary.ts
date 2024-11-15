import { BaseCharacterClass } from '../../CharacterClasses';
import { PlayableCard } from '../../PlayableCard';
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
        return [
            new BlackhandClass(),
            new DiabolistClass(),
            new ArchonClass(),
        ];
    }

    public getCardsForClass(characterClass: BaseCharacterClass): PlayableCard[] {
        return characterClass.availableCards;
    }

    public getAllCards(): PlayableCard[] {
        return [
            ... this.getCharacterClasses().flatMap(c => c.availableCards),
        ];
    }
}
