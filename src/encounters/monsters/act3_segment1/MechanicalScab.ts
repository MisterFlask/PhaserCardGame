import { AbstractIntent, AttackIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { GrowingPowerBuff } from "../../../gamecharacters/buffs/standard/GrowingPower";

export class MechanicalScab extends AutomatedCharacter {
    constructor(){
        super({
            name: 'Mechanical Scab',
            portraitName: 'robot-minion',
            maxHitpoints: 15,
            description: 'A crude automaton patched together from scrap.'
        });
        this.buffs.push(new GrowingPowerBuff(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 5, owner: this }) ];
    }
}
