import { BaseCharacterClass, PlayerCharacter } from '../gamecharacters/CharacterClasses';
import { BlackhandClass, DiabolistClass } from '../gamecharacters/SpecificClasses';

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
        const classes: BaseCharacterClass[] = [new DiabolistClass(), new BlackhandClass()];
        const characters: PlayerCharacter[] = [];

        for (let i = 0; i < 5; i++) {
            const randomClass = classes[Math.floor(Math.random() * classes.length)];
            const character = new PlayerCharacter({ 
                name: `Character ${i + 1} (${randomClass.name})`, 
                portraitName: 'placeholder', 
                characterClass: randomClass 
            });
            
            randomClass.availableCards.forEach(card => {
                character.cardsInMasterDeck.push(card.Copy());
                character.cardsInMasterDeck.forEach(card=> {
                    card.owner = character;
                })
            });
            characters.push(character);
        }

        return characters;
    }

    // Other campaign-related methods can be added here
}