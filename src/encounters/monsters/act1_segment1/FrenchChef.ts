import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Delicious } from '../../../gamecharacters/buffs/enemy_buffs/Delicious';

export class FrenchChef extends AutomatedCharacter {
    constructor() {
        super({
            name: "Le Chef Gourmand",
            portraitName: "Eldritch Slime Spawn",
            maxHitpoints: 25,
            description: "Ah yes, french cuisine—where snails are a 'delicacy' and they consider raw beef and a runny egg an entire meal."
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 8, owner: this }).withTitle("Cleaver Slash")
            ],
            [
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Delicious(1), owner: this }).withTitle("Seasoning"),
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Delicious(1), owner: this }).withTitle("Seasoning")
            ]
        ];

        return IntentListCreator.selectRandomIntents(intents);
    }
}
