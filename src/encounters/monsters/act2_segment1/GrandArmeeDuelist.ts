import { AbstractIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Duelist } from "../../../gamecharacters/buffs/enemy_buffs/Duelist";

export class GrandArmeeDuelist extends AutomatedCharacter {
    constructor() {
        super({
            name: "Grand Armée Duelist",
            portraitName: "aristocrat_1",
            maxHitpoints: 95,
            description: "An officer of the old school, and appalled - genuinely, personally appalled - by the notion of a general engagement. He selected one of us at the outset, by means of a small formal bow I did not know how to answer, and has fought no one else since; every blow the rest of the party lands simply passes through him like weather. Honour, he explained, when I asked. I did not have a satisfactory answer for the man he'd chosen, who by then had rather a lot of holes in his coat."
        });
        this.buffs.push(new Duelist());
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 16, owner: this }).withTitle("Satisfaction")
            ],
            [
                new AttackIntent({ baseDamage: 10, owner: this }).withTitle("En Garde"),
                new AttackIntent({ baseDamage: 10, owner: this }).withTitle("En Garde")
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
