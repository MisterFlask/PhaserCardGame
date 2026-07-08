import { AbstractIntent, ApplyBuffToAllEnemyCharactersIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";

// HP band: act-3 Union Runner (42, also an ally-buffing support unit) + ~20%.
export class ChoirNovice extends AutomatedCharacter {
    constructor() {
        super({
            name: "Choir Novice",
            portraitName: "",
            maxHitpoints: 50,
            description: "Cavendish survey note: young, robed, and singing throughout the engagement in a register that does something unpleasant to the fillings. The hymn has no words I recognized as words, but the compound's other residents plainly understood it - every one of them fought harder for as long as the novice kept singing. Stopped only when struck, and resumed, without apparent resentment, the moment she recovered her breath."
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [ new ApplyBuffToAllEnemyCharactersIntent({ debuff: new Lethality(2), owner: this }).withTitle('Choir Hymn') ],
            [ new AttackIntent({ baseDamage: 6, owner: this }).withTitle('Censer Strike') ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
