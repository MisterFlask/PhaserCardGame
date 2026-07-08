import { AbstractIntent, AttackIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { GrowingPowerBuff } from "../../../gamecharacters/buffs/standard/GrowingPower";

export class MechanicalScab extends AutomatedCharacter {
    constructor(){
        super({
            name: 'Mechanical Scab',
            portraitName: 'robot-minion',
            // Balance note (measured 2026-07): the base MechanicalScab x2
            // encounter measured 75-98% greedy win rate across squad sizes,
            // n=40 -- a free win contributing to act 3 sitting above target.
            // +20% HP (this class is also used as CompanyOverseer's and
            // FurnaceForeman's summon -- see their balance notes -- so this
            // also makes their summoned reinforcements slightly less
            // disposable, which is a reasonable side effect rather than a
            // problem).
            maxHitpoints: 18,
            description: "Riveted together from whatever the foundry floor had lying about, and sent in to do a striking man's job at a fraction of a striking man's wage - the Barons' answer to the labour question, more or less. Slow to start but seems to learn as it goes, each swing landing a touch harder than the last, which I understand is meant to demonstrate the superiority of mechanical over union labour. The Stokers we spoke to had rather choice opinions on the matter."
        });
        this.buffs.push(new GrowingPowerBuff(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 5, owner: this }) ];
    }
}
