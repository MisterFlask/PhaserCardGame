import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { SelfDestruct } from "../../../gamecharacters/buffs/enemy_buffs/SelfDestruct";

export class OverpressureStoker extends AutomatedCharacter {
    constructor() {
        super({
            name: "Overpressure Stoker",
            portraitName: "coal_golem",
            maxHitpoints: 90,
            description: "Fed his own boiler past every regulation the Union ever won, on quota orders from a manager who is, I note for the record, not present. The gauge on his chest reads a colour I don't have a word for and is climbing. He is entirely aware of what happens at zero and entirely unwilling to discuss stopping. Recommend we finish this one quickly, or at a considerable distance, or ideally both."
        });
        this.buffs.push(new SelfDestruct(22, 3));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 12, owner: this }).withTitle('Shovel Strike')
            ],
            [
                new BlockForSelfIntent({ blockAmount: 10, owner: this }).withTitle('Vent The Pressure'),
                new AttackIntent({ baseDamage: 6, owner: this }).withTitle('Vent The Pressure')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
