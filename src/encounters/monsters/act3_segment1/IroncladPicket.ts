import { AbstractIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Bulwark } from "../../../gamecharacters/buffs/standard/Bulwark";
import { ReactiveShielding } from "../../../gamecharacters/buffs/standard/ReactiveShielding";

export class IroncladPicket extends AutomatedCharacter {
    constructor() {
        super({
            name: "Ironclad Picket",
            portraitName: "brigand_symbol_2",
            maxHitpoints: 120,
            description: "A Baron's man stationed at the gate between two furnace halls, plated in enough scavenged sheet-iron to make a considerable racket simply breathing. He does not appear to react to being struck so much as recalibrate - the first solid hit any of us landed was answered, a beat later, by a wall of plating none of us had seen him raise. Standing his ground appears to be the entire remit. He is extremely good at it."
        });
        this.buffs.push(new ReactiveShielding(12));
        this.buffs.push(new Bulwark(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 14, owner: this }).withTitle('Iron Fist')
            ],
            [
                new AttackIntent({ baseDamage: 8, owner: this }).withTitle('Truncheon'),
                new AttackIntent({ baseDamage: 8, owner: this }).withTitle('Truncheon')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
