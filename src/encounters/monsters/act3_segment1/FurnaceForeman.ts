import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, ApplyDebuffToRandomCharacterIntent, AttackAllPlayerCharactersIntent, AttackIntent, IntentListCreator, SummonIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Armored } from "../../../gamecharacters/buffs/standard/Armored";
import { Burning } from "../../../gamecharacters/buffs/standard/Burning";
import { Vulnerable } from "../../../gamecharacters/buffs/standard/Vulnerable";
import { Exploitation } from "../../../gamecharacters/buffs/standard/Exploitation";
import { Bloodsucker } from "../../../gamecharacters/buffs/standard/Bloodsucker";
import { MechanicalScab } from "./MechanicalScab";

export class FurnaceForeman extends AutomatedCharacter {
    constructor(){
        super({
            name: 'Furnace Foreman',
            portraitName: 'foreman',
            maxHitpoints: 80,
            description: "Runs his stretch of the Furnace like a man who has personally never been burned by it, which seems statistically improbable given the surroundings. Armoured in overlapping forge-plate that turns most blows, and free with the bellows-blast when conversation fails, which it did almost immediately. Brought in a scab automaton to break the picket line the moment we started winning, a move I found professionally impressive and personally very inconvenient."
        });
        this.buffs.push(new Armored(2));
        this.buffs.push(new Exploitation(2));
        this.buffs.push(new Bloodsucker(3));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 6, owner: this }).withTitle('Bellows Blast'),
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Burning(1), owner: this })
            ],
            [
                new AttackIntent({ baseDamage: 14, owner: this }).withTitle('Molten Pour'),
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Vulnerable(2), owner: this })
            ],
            [
                new AttackIntent({ baseDamage: 10, owner: this }).withTitle('Strikebreaker'),
                new SummonIntent({ monsterToSummon: new MechanicalScab(), owner: this })
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
