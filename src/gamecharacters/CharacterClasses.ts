import { BaseCharacter, Gender } from "./BaseCharacter";
import { PlayableCard } from "./PlayableCard";



export abstract class BaseCharacterClass {
    constructor({ name, iconName, startingMaxHp }: { name: string; iconName: string, startingMaxHp: number }) {
        this.name = name
        this.iconName = iconName
        this.availableCards = []
        this.startingMaxHp = startingMaxHp
    }

    name: string
    iconName: string
    availableCards: PlayableCard[]
    cardBackgroundImageName: string = "greyscale"
    startingMaxHp: number

    abstract getPortraitNameAtRandom(gender: Gender): string;

    addCard(card: PlayableCard) {
        this.availableCards.push(card);
    }

    createCharacterFromClass(){
        return new PlayerCharacter({ name: this.name, portraitName: this.iconName, characterClass: this })
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
}

