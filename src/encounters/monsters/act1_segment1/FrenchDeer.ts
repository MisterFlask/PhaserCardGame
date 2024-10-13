import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackAllPlayerCharactersIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Burning } from '../../../gamecharacters/buffs/standard/Burning';

export class FrenchDeer extends AutomatedCharacter {
    constructor() {
        super({
            name: "Le Cerf Ardent",
            portraitName: "Eldritch Corruption Deer",
            maxHitpoints: 30,
            description: "Antlers sharp as philosophy, refracting light into spectral halos that contain glimpses of forgotten monarchies"
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Burning(8), owner: this }).withTitle("Ignite")
            ],
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 4, owner: this }).withTitle("Inferno Charge")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}