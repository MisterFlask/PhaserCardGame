import { Gender } from "./BaseCharacter";
import { PlayerCharacter } from "./BaseCharacterClass";
import { CharacterNameGenerator } from "./CharacterNameGenerator";
import { ArchonClass } from "./playerclasses/ArchonClass";
import { BlackhandClass } from "./playerclasses/BlackhandClass";
import { DiabolistClass } from "./playerclasses/DiabolistClass";

export class CharacterGenerator {
    static generateRandomCharacter(): PlayerCharacter {
        // Randomly select a class
        const characterClasses = [
            new ArchonClass(),
            new BlackhandClass(), 
            new DiabolistClass()
        ];

        const selectedClass = characterClasses[Math.floor(Math.random() * characterClasses.length)];

        // Randomly select gender
        const gender = Gender.Female;

        // Get random portrait for the class/gender combo
        const portraitName = selectedClass.getPortraitNameAtRandom(gender);

        // Create character from class
        const character = selectedClass.createCharacterFromClass();
        character.portraitName = portraitName;
        character.gender = gender;
        character.name = CharacterNameGenerator.getRandomName(gender);

        return character;
    }
}
