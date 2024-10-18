import { PlayableCard } from '../../PlayableCard';
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

    public getAllCards(): PlayableCard[] {
        return [
            ... new BlackhandClass().availableCards,
            ... new DiabolistClass().availableCards,
        ];
    }
}
