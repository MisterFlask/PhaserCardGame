import { AbstractIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Duelist } from "../../../gamecharacters/buffs/enemy_buffs/Duelist";

export class GrandArmeeDuelist extends AutomatedCharacter {
    constructor() {
        super({
            name: "Grand Armée Duelist",
            portraitName: "aristocrat_1",
            // Balance note (measured 2026-07): Duelist means only ONE squad
            // member can ever damage this enemy, so its effective
            // HP-per-available-attacker is ~4x a normal enemy's. Paired with
            // Skeeterwisp Swarm x1 (post comp-split, see EncounterManager.ts's
            // Act2_Segment1 comment) it measured ~14% greedy win rate at
            // squad 3, n=50 -- the worst act-2 outlier. A first -25% HP cut
            // (to 71) didn't move the needle (still ~14%, n=50): the
            // designated foe faces both the HP grind AND ~13 dmg/turn alone
            // with no squadmate able to help either offensively or by
            // splitting the damage, so HP alone wasn't the whole story.
            // Second pass: HP cut further and both attack intents shaved so
            // the lone designated fighter can plausibly out-race the damage
            // race even with an average card draw.
            maxHitpoints: 55,
            description: "An officer of the old school, and appalled - genuinely, personally appalled - by the notion of a general engagement. He selected one of us at the outset, by means of a small formal bow I did not know how to answer, and has fought no one else since; every blow the rest of the party lands simply passes through him like weather. Honour, he explained, when I asked. I did not have a satisfactory answer for the man he'd chosen, who by then had rather a lot of holes in his coat."
        });
        this.buffs.push(new Duelist());
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 13, owner: this }).withTitle("Satisfaction")
            ],
            [
                new AttackIntent({ baseDamage: 8, owner: this }).withTitle("En Garde"),
                new AttackIntent({ baseDamage: 8, owner: this }).withTitle("En Garde")
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
