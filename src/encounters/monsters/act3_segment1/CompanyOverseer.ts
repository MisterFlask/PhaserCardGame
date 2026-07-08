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
            // Balance note (measured 2026-07): solo (post comp-split, see
            // EncounterManager.ts's Act3_Segment1 comment) measured ~16.7%
            // greedy win rate at squad 3, n=30. A first HP-only cut to 56
            // (-20%) overcorrected to ~3.3%; a second pass (63 HP, lower
            // Bloodsucker/Exploitation, Crackdown 12->10/20->16) only
            // recovered to ~18% (n=50) -- the Efficiency Expert summon fires
            // every OTHER turn, so multiple independently-ramping
            // GrowingPower MechanicalScabs (see MechanicalScab.ts) pile up
            // before the Overseer itself goes down. Third pass: HP trimmed
            // further so the fight resolves before scabs can stack deep, and
            // Crackdown's attack shaved once more.
            maxHitpoints: 50,
            description: "A Baron's man, middling rank, who has clearly mistaken the Furnace floor for a public school and himself for the housemaster. Carries a ledger he consults before every blow, apparently to confirm he is still within his disciplinary allowance for the shift. Draws strength from every worker he wounds, which he regards as sound economics rather than anything requiring justification. Requisitioned a scab labourer to do his fighting for him within the first minute of the engagement - efficient, I'll grant him that."
        });
        this.buffs.push(new Bulwark(1));
        this.buffs.push(new Exploitation(1));
        this.buffs.push(new Bloodsucker(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [ new SummonIntent({ monsterToSummon: new MechanicalScab(), owner: this }).withTitle('Efficiency Expert') ],
            [
                new BlockForSelfIntent({ blockAmount: 10, owner: this }).withTitle('Crackdown'),
                new AttackIntent({ baseDamage: 13, owner: this })
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
