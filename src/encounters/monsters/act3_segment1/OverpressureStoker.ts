import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { SelfDestruct } from "../../../gamecharacters/buffs/enemy_buffs/SelfDestruct";

export class OverpressureStoker extends AutomatedCharacter {
    constructor() {
        super({
            name: "Overpressure Stoker",
            portraitName: "coal_golem",
            // Balance note (measured 2026-07): stayed pegged at 100% greedy
            // win rate at act3/squad3 through three AoE-only passes (22->28->
            // 34->40, n=40/50/60/60). Realized 90 HP was letting a greedy
            // squad occasionally kill it BEFORE the 3-turn timer, denying
            // the self-destruct AoE entirely and banking a cheap win --
            // raised HP so the explosion reliably lands, which is the
            // intended "fair fixed-damage-then-boom" identity of the fight.
            maxHitpoints: 115,
            description: "Fed his own boiler past every regulation the Union ever won, on quota orders from a manager who is, I note for the record, not present. The gauge on his chest reads a colour I don't have a word for and is climbing. He is entirely aware of what happens at zero and entirely unwilling to discuss stopping. Recommend we finish this one quickly, or at a considerable distance, or ideally both."
        });
        this.buffs.push(new SelfDestruct(40, 3));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 17, owner: this }).withTitle('Shovel Strike')
            ],
            [
                new BlockForSelfIntent({ blockAmount: 8, owner: this }).withTitle('Vent The Pressure'),
                new AttackIntent({ baseDamage: 11, owner: this }).withTitle('Vent The Pressure')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
