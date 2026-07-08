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
            // Balance note (measured 2026-07): solo (post comp-split, see
            // EncounterManager.ts's Act3_Segment1 comment) measured the
            // single worst outlier of the whole sweep -- ~10% greedy win
            // rate at squad 3, n=30. First pass (-20% HP to 64) only
            // recovered to ~13-26% (n=30/50) -- the AttackAll+Burning plus
            // self-sustaining Exploitation/Bloodsucker plus a periodic scab
            // summon (same compounding-adds issue as CompanyOverseer, see
            // its balance note) needed a second pass: HP trimmed further,
            // Exploitation/Bloodsucker stacks halved, and the Molten Pour
            // spike reduced 14->11.
            maxHitpoints: 56,
            description: "Runs his stretch of the Furnace like a man who has personally never been burned by it, which seems statistically improbable given the surroundings. Armoured in overlapping forge-plate that turns most blows, and free with the bellows-blast when conversation fails, which it did almost immediately. Brought in a scab automaton to break the picket line the moment we started winning, a move I found professionally impressive and personally very inconvenient."
        });
        this.buffs.push(new Armored(2));
        this.buffs.push(new Exploitation(1));
        this.buffs.push(new Bloodsucker(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 6, owner: this }).withTitle('Bellows Blast'),
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Burning(1), owner: this })
            ],
            [
                new AttackIntent({ baseDamage: 11, owner: this }).withTitle('Molten Pour'),
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
