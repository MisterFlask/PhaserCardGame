import { BaseCharacter, Gender } from "./BaseCharacter";
import { PlayableCard } from "./PlayableCard";


export abstract class BaseCharacterClass {
    constructor({ name, iconName, startingMaxHp, id }: { name: string; iconName: string, startingMaxHp: number, id: string }) {
        this.name = name
        this.iconName = iconName
        this.availableCards = []
        this.id = id
        this.startingMaxHp = startingMaxHp
    }
    
    id: string;
    name: string
    iconName: string
    availableCards: PlayableCard[]
    cardBackgroundImageName: string = "greyscale"
    startingMaxHp: number
    longDescription: string = ""

    abstract getPortraitNameAtRandom(gender: Gender): string;

    initialize() {
        this.availableCards.forEach(card => card.nativeToCharacterClass = this)
    }


    public getUniqueStartingCards(): PlayableCard[] {
        return []
    }


    addCard(card: PlayableCard) {
        this.availableCards.push(card);
    }
}

export class PlayerCharacter extends BaseCharacter {
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

