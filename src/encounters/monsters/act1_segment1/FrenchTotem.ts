import { AbstractIntent, AttackAllPlayerCharactersIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';

export class FrenchTotem extends AutomatedCharacter {
    constructor() {
        super({
            name: "Totem de Stress",
            portraitName: "Stress Totem",
            maxHitpoints: 5,
            description: "A small, unsettling totem that emanates an aura of anxiety."
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 1, owner: this }).withTitle("Hateful Aura")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}
