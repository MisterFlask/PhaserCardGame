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
            // Balance note (measured 2026-07): solo (post comp-split, see
            // EncounterManager.ts's Act3_Segment1 comment) still measured
            // ~40% greedy win rate at squad 3, n=30 -- tanky relative to
            // segment-1 peers (CompanyBailiff 88 HP, OverpressureStoker 90
            // HP, MoltenAgitator 50 HP). -18% HP.
            maxHitpoints: 135,
            description: "The Stoker's Union keeps men like this for what they term 'wage disputes,' a phrase I now understand to mean considerably more than strongly worded correspondence. Built like a boiler himself, plated in scavenged armour, and slow enough that you'd think him manageable right up until his fist finds you regardless. Alternates between simple violence and a very effective line in intimidation - stress and doubt in roughly equal measure, delivered with a look that suggests he's disappointed rather than angry, which is somehow worse."
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
