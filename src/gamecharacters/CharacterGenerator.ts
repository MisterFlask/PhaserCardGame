import { Gender } from "./BaseCharacter";
import { BaseCharacterClass } from "./BaseCharacterClass";
import { AbstractBuff } from "./buffs/AbstractBuff";
import { Badass } from "./buffs/persona/Badass";
import { BloodKnight } from "./buffs/persona/BloodKnight";
import { CapitalistSoul } from "./buffs/persona/CapitalistSoul";
import { Daring } from "./buffs/persona/Daring";
import { HeavySmoker } from "./buffs/persona/HeavySmoker";
import { Merchant } from "./buffs/persona/Merchant";
import { Scholar } from "./buffs/persona/Scholar";
import { StrongBack } from "./buffs/persona/StrongBack";
import { Undersider } from "./buffs/persona/Undersider";
import { WellDrilled } from "./buffs/persona/WellDrilled";
import { IncreaseBlood } from "./buffs/standard/combatresource/IncreaseBlood";
import { IncreaseIron } from "./buffs/standard/combatresource/IncreaseMetal";
import { IncreasePages as IncreaseAshes } from "./buffs/standard/combatresource/IncreasePages";
import { IncreaseSmog } from "./buffs/standard/combatresource/IncreaseSmog";
import { IncreaseVenture } from "./buffs/standard/combatresource/IncreaseVenture";
import { Lethality } from "./buffs/standard/Lethality";
import { CharacterNameGenerator } from "./CharacterNameGenerator";
import { EntityRarity } from "./EntityRarity";
import { PlayableCard } from "./PlayableCard";
import { PlayerCharacter } from "./PlayerCharacter";
import { ArchonClass } from "./playerclasses/ArchonClass";
import { BlackhandClass } from "./playerclasses/BlackhandClass";
import { Defend } from "./playerclasses/cards/basic/Defend";
import { FireRevolver } from "./playerclasses/cards/basic/FireRevolver";
import { Rummage } from "./playerclasses/cards/basic/Rummage";
import { CogClass } from "./playerclasses/CogClass";
import { DiabolistClass } from "./playerclasses/DiabolistClass";

export class CharacterGenerator {
    private static instance: CharacterGenerator;
    
    private constructor() {}

    public static getInstance(): CharacterGenerator {
        if (!CharacterGenerator.instance) {
            CharacterGenerator.instance = new CharacterGenerator();
        }
        return CharacterGenerator.instance;
    }

    generateRandomCharacter(): PlayerCharacter {
        // Randomly select a class
        const characterClasses = [
            new ArchonClass(),
            new BlackhandClass(), 
            new DiabolistClass(),
            new CogClass(),
        ];

        const selectedClass = characterClasses[Math.floor(Math.random() * characterClasses.length)];

        // Randomly select gender
        const gender = Gender.Female;

        // Get random portrait for the class/gender combo
        const portraitName = selectedClass.getPortraitNameAtRandom(gender);

        // Create character from class
        const character = CharacterGenerator.getInstance().createCharacterFromClass(selectedClass);
        character.portraitName = portraitName;
        character.gender = gender;
        character.name = CharacterNameGenerator.getRandomName(gender);

        return character;
    }

    public generateStartingDeck(characterClass: BaseCharacterClass): PlayableCard[] {
        const deck = [
            this.generateImprovedShoot(),
            new Defend(), 
            this.getRandomCommonCard(characterClass)
        ]
        // now add EITHER a FireRevolver OR a defend to the deck
        if (Math.random() < 0.5) {
            deck.push(new FireRevolver());
        } else {
            deck.push(new Defend());
        }
        return deck;
    }    

    private generateImprovedShoot(): PlayableCard {
        var shoot = new FireRevolver().withBuffs([this.getRandomStartingAttackBuff()]).Copy();
        shoot.name += "+";
        return shoot;
    }

    private getRandomCommonCard(characterClass: BaseCharacterClass): PlayableCard {
        return characterClass.availableCards
            .filter(card => card.rarity === EntityRarity.COMMON)
            .sort(() => Math.random() - 0.5)[0] ?? new Rummage()
            .Copy();
    }

    generateStartingPersonaTraits(): AbstractBuff {
        const buffs = [
            new Scholar(), 
            new WellDrilled(2), 
            new StrongBack(2), 
            new Undersider(20), 
            new Merchant(35),
            new Badass(1),
            new HeavySmoker(1),
            new CapitalistSoul(1),
            new Daring(1),
            new BloodKnight(1)
        ]
        return buffs[Math.floor(Math.random() * buffs.length)].clone()
    }

    createCharacterFromClass(characterClass: BaseCharacterClass){
        var character = new PlayerCharacter({ name: characterClass.name, portraitName: characterClass.iconName, characterClass: characterClass })
        character.cardsInMasterDeck = CharacterGenerator.getInstance().generateStartingDeck(characterClass)
        character.startingDeck = character.cardsInMasterDeck.slice().map(card => card.Copy())
        
        // Assign the character as owner to all cards in the deck
        for (const card of character.cardsInMasterDeck) {
            card.owningCharacter = character;
        }
        
        character.buffs = [CharacterGenerator.getInstance().generateStartingPersonaTraits()]

        return character
    }

    private getRandomStartingAttackBuff(): AbstractBuff {
        const buffs = [new IncreaseAshes(), new IncreaseIron(), new IncreaseVenture(), new IncreaseSmog(), new IncreaseBlood(), new Lethality(4)]
        return buffs[Math.floor(Math.random() * buffs.length)]
    }
}
