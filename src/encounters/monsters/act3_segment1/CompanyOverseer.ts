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
            description: "A Baron's man, middling rank, who has clearly mistaken the Furnace floor for a public school and himself for the housemaster. Carries a ledger he consults before every blow, apparently to confirm he is still within his disciplinary allowance for the shift. Draws strength from every worker he wounds, which he regards as sound economics rather than anything requiring justification. Requisitioned a scab labourer to do his fighting for him within the first minute of the engagement - efficient, I'll grant him that."
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
