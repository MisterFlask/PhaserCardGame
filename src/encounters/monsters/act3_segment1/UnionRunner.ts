import { AbstractIntent, ApplyBuffToAllEnemyCharactersIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Implacable } from "../../../gamecharacters/buffs/standard/Implacable";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";

export class UnionRunner extends AutomatedCharacter {
    constructor() {
        super({
            name: "Union Runner",
            portraitName: "sigil_bird",
            maxHitpoints: 42,
            description: "Carries word between picket lines faster than the Barons' own telegraph, mostly by refusing to stop moving even when struck down, which he did twice in front of me and got up from both times looking mildly inconvenienced rather than dead. Not much of a fighter himself, by his own cheerful admission - his trade is shouting the right two words to the right shift at the right moment, and watching the whole floor answer."
        });
        this.buffs.push(new Implacable(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 7, owner: this }).withTitle('Cosh')
            ],
            [
                new ApplyBuffToAllEnemyCharactersIntent({ debuff: new Lethality(2), owner: this }).withTitle('Pass The Word')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
