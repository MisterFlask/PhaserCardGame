import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Burning } from '../../../gamecharacters/buffs/standard/Burning';

export class Echophagist extends AutomatedCharacter {
    constructor() {
        super({
            name: "Marsh Stag",
            portraitName: "symbol_deer",
            maxHitpoints: 30,
            description: "Came upon a stag at dawn - massive thing, standing in the mist. Its antlers were draped with marsh moss, and it watched me with an intelligence that made my blood run cold. I've hunted deer at Balmoral, but this... this was different. It moved wrong, too deliberate. When it finally turned away, I swear I heard it wheeze like a consumptive. Didn't dare shoot - ammunition is too precious here."
        });
        
        this.portraitTargetLargestDimension = 300;
        this.portraitOffsetXOverride = -40
        this.portraitOffsetYOverride = 0
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Burning(2), owner: this }).withTitle("Prism")
            ],
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 4, owner: this }).withTitle("Charge")
            ],
            [
                new AttackIntent({ baseDamage: 10, owner: this }).withTitle("Horn Charge")
            ]
        ];

        return IntentListCreator.selectRandomIntents(intents);
    }
}
