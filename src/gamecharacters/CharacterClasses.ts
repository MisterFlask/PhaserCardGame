import { PlayableCard } from "./AbstractCard";
import { AbstractIntent } from "./AbstractIntent";
import { BaseCharacter } from "./BaseCharacter"
import { AbstractCard } from "./PhysicalCard";

export class BaseCharacterClass {
    constructor({ name, iconName, startingMaxHp }: { name: string; iconName: string, startingMaxHp: number }) {
        this.name = name
        this.iconName = iconName
        this.availableCards = []
        this.startingMaxHp = startingMaxHp
    }

    name: string
    iconName: string
    availableCards: AbstractCard[]
    startingMaxHp: number

    addCard(card: AbstractCard) {
        this.availableCards.push(card)
    }

    createCharacterFromClass(){
        return new PlayerCharacter({ name: this.name, portraitName: this.iconName, characterClass: this })
    }
}

export class PlayerCharacter extends BaseCharacter {
    cardsInMasterDeck: AbstractCard[];
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

// represents a character that is controlled by the game, not the player.
// generally enemies.
export class AutomatedCharacter extends BaseCharacter {
    intents: AbstractIntent[] = [];
    constructor({ name, portraitName, description, maxHitpoints }
        : {name: string; portraitName: string; description?: string; maxHitpoints: number}) {
        super({ name: name, portraitName: portraitName, maxHitpoints: maxHitpoints, description: description })
    }


    public setNewIntents(){
        this.intents = this.generateNewIntents();
    }

    public generateNewIntents(): AbstractIntent[]{
        return [];
    }
}

