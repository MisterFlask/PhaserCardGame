import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent, DoSomethingIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Armored } from "../../../gamecharacters/buffs/standard/Armored";
import { Lumbering } from "../../../gamecharacters/buffs/enemy_buffs/Lumbering";
import { RevolutionaryFervor } from "../../../gamecharacters/buffs/standard/RevolutionaryFervor";
import { Weak } from "../../../gamecharacters/buffs/standard/Weak";
import { Stress } from "../../../gamecharacters/buffs/standard/Stress";
import { StunnedBuff } from "../../../gamecharacters/buffs/playable_card/Stunned";

export class UnionEnforcer extends AutomatedCharacter {
    constructor(){
        super({
            name: 'Union Enforcer',
            portraitName: 'tough-worker',
            maxHitpoints: 165,
            description: 'Heavy muscle for the cause.'
        });
        this.buffs.push(new RevolutionaryFervor(9));
        this.buffs.push(new Armored(3));
        this.buffs.push(new Lumbering(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 12, owner: this }).withTitle('Knuckle Duster'),
                new ApplyDebuffToRandomCharacterIntent({ debuff: new StunnedBuff(1), owner: this })
            ],
            [
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Stress(2), owner: this }).withTitle('Intimidate'),
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Weak(2), owner: this })
            ],
            [
                new AttackIntent({ baseDamage: 18, owner: this }).withTitle("Workers' Justice")
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
