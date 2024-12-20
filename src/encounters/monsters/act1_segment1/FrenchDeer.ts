import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Burning } from '../../../gamecharacters/buffs/standard/Burning';

export class FrenchDeer extends AutomatedCharacter {
    constructor() {
        super({
            name: "Deer",
            portraitName: "Eldritch Corruption Deer",
            maxHitpoints: 30,
            description: "Antlers sharp as philosophy, refracting light into spectral halos that contain glimpses of forgotten monarchies"
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Burning(2), owner: this }).withTitle("Ignite")
            ],
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 4, owner: this }).withTitle("Inferno Charge")
            ],
            [
                new AttackIntent({ baseDamage: 10, owner: this }).withTitle("Horn Charge")
            ]
        ];

        return IntentListCreator.selectRandomIntents(intents);
    }
}
