import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator, SummonIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Bulwark } from "../../../gamecharacters/buffs/standard/Bulwark";
import { Exploitation } from "../../../gamecharacters/buffs/standard/Exploitation";
import { Bloodsucker } from "../../../gamecharacters/buffs/standard/Bloodsucker";
import { MechanicalScab } from "./MechanicalScab";

export class CompanyOverseer extends AutomatedCharacter {
    constructor(){
        super({
            name: 'Company Overseer',
            portraitName: 'overseer',
            maxHitpoints: 70,
            description: 'A ruthless manager of hellish industry.'
        });
        this.buffs.push(new Bulwark(2));
        this.buffs.push(new Exploitation(2));
        this.buffs.push(new Bloodsucker(3));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [ new SummonIntent({ monsterToSummon: new MechanicalScab(), owner: this }).withTitle('Efficiency Expert') ],
            [
                new BlockForSelfIntent({ blockAmount: 12, owner: this }).withTitle('Crackdown'),
                new AttackIntent({ baseDamage: 20, owner: this })
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
