import { PlayerCharacter, BaseCharacterClass, DiabolistClass, BlackhandClass } from '../gamecharacters/CharacterClasses';

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
                portraitName: 'flamer1', 
                characterClass: randomClass 
            });
            randomClass.availableCards.forEach(card => {
                character.cardsInMasterDeck.push(card.Copy());
            });
            characters.push(character);
        }

        return characters;
    }

    // Other campaign-related methods can be added here
}