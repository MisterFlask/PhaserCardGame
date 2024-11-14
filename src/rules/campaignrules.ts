import { PlayerCharacter } from '../gamecharacters/CharacterClasses';
import { CharacterGenerator } from '../gamecharacters/CharacterGenerator';

export class CampaignRules {
    private static instance: CampaignRules;

    private constructor() {}

    public static getInstance(): CampaignRules {
        if (!CampaignRules.instance) {
            CampaignRules.instance = new CampaignRules();
        }
        return CampaignRules.instance;
    }

    public generateLogicalCharacterRoster(): PlayerCharacter[] {
        const characters: PlayerCharacter[] = [];

        for (let i = 0; i < 5; i++) {
            const character = CharacterGenerator.generateRandomCharacter();
            
            // Reroll portrait up to 5 times to avoid duplicates
            let attempts = 0;
            while (attempts < 5 && characters.some(c => c.portraitName === character.portraitName)) {
                character.portraitName = character.characterClass.getPortraitNameAtRandom(character.gender);
                attempts++;
            }
            
            characters.push(character);
        }

        return characters;
    }

    // Other campaign-related methods can be added here
}