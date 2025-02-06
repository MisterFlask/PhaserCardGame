import { BaseCharacter } from "./BaseCharacter";
import { BaseCharacterClass } from "./BaseCharacterClass";
import { PlayableCard } from "./PlayableCard";

export class PlayerCharacter extends BaseCharacter {
    startingDeck: PlayableCard[] = [];
    cardsInMasterDeck: PlayableCard[];
    characterClass: BaseCharacterClass;
    
    constructor({ name, portraitName, characterClass, description }
        : {name: string; portraitName: string; characterClass: BaseCharacterClass, description?: string}) {
        super({ name, portraitName, maxHitpoints: characterClass.startingMaxHp, description })
        this.cardsInMasterDeck = [];
        this.hitpoints = characterClass.startingMaxHp;
        this.maxHitpoints = characterClass.startingMaxHp;
        this.characterClass = characterClass;
    }

    removeCard(card: PlayableCard) {
        this.cardsInMasterDeck = this.cardsInMasterDeck.filter(c => c?.id !== card?.id);
    }

    addCard(card: PlayableCard) {
        card.owningCharacter = this;
        this.cardsInMasterDeck.push(card);
    }
} 