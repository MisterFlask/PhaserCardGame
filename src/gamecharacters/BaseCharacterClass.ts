import { BaseCharacter, Gender } from "./BaseCharacter";
import { AbstractBuff } from "./buffs/AbstractBuff";
import { Merchant } from "./buffs/persona/Merchant";
import { Scholar } from "./buffs/persona/Scholar";
import { StrongBack } from "./buffs/persona/StrongBack";
import { Undersider } from "./buffs/persona/Undersider";
import { WellDrilled } from "./buffs/persona/WellDrilled";
import { IncreaseIron } from "./buffs/standard/combatresource/IncreaseIron";
import { IncreasePages } from "./buffs/standard/combatresource/IncreasePages";
import { IncreasePowder } from "./buffs/standard/combatresource/IncreasePowder";
import { IncreaseSmog } from "./buffs/standard/combatresource/IncreaseSmog";
import { IncreaseVenture } from "./buffs/standard/combatresource/IncreaseVenture";
import { Strong } from "./buffs/standard/Strong";
import { EntityRarity, PlayableCard } from "./PlayableCard";
import { Defend } from "./playerclasses/cards/basic/Defend";
import { Shoot } from "./playerclasses/cards/basic/Shoot";


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

    abstract getPortraitNameAtRandom(gender: Gender): string;

    initialize() {
        this.availableCards.forEach(card => card.nativeToCharacterClass = this)
    }


    addCard(card: PlayableCard) {
        this.availableCards.push(card);
    }

    createCharacterFromClass(){
        var character = new PlayerCharacter({ name: this.name, portraitName: this.iconName, characterClass: this })
        character.cardsInMasterDeck = this.generateStartingDeck()
        for (const card of character.cardsInMasterDeck) {
            card.owner = character;
        }
        character.buffs = [this.generateStartingPersonaTraits()]

        return character
    }

    generateStartingDeck(): PlayableCard[] {
        return [new Shoot(), 
            this.generateImprovedShoot(),
            new Defend(), 
            new Defend()
            , this.getRandomCommon()
        ]
    }    
    
    generateImprovedShoot(): PlayableCard {
        var shoot = new Shoot().withBuffs([this.getRandomResourceIncreaseBuff()]).Copy();
        shoot.name += "+";
        return shoot;
    }


    private getRandomCommon(): PlayableCard {
        return this.availableCards
            .filter(card => card.rarity === EntityRarity.COMMON)
            .sort(() => Math.random() - 0.5)[0] ?? new Shoot().withBuffs([new Strong(2)])
                .Copy();
    }

    generateStartingPersonaTraits(): AbstractBuff {
        const buffs = [new Scholar(), new WellDrilled(), new StrongBack(2), new Undersider(20), new Merchant(35)]
        return buffs[Math.floor(Math.random() * buffs.length)].clone()
    }

    private getRandomResourceIncreaseBuff(): AbstractBuff {
        const buffs = [new IncreasePages(), new IncreaseIron(), new IncreaseVenture(), new IncreaseSmog(), new IncreasePowder()]
        return buffs[Math.floor(Math.random() * buffs.length)]
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

