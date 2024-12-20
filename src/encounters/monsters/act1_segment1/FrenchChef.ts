import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Delicious } from '../../../gamecharacters/buffs/enemy_buffs/Delicious';

export class FrenchChef extends AutomatedCharacter {
    constructor() {
        super({
            name: "Seasoner",
            portraitName: "Eldritch Slime Spawn",
            maxHitpoints: 25,
            description: "you will be baked, and then there will be cake"
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 3, owner: this }).withTitle("Gorge Self")
            ],
            [
                new AttackIntent({ baseDamage: 8, owner: this }).withTitle("Cleaver Slash")
            ],
            [
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Delicious(2), owner: this }).withTitle("Seasoning"),
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Delicious(2), owner: this }).withTitle("Seasoning")
            ]
        ];

        return IntentListCreator.selectRandomIntents(intents);
    }
}
