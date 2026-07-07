import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { AuditPressure } from "../../../gamecharacters/buffs/enemy_buffs/AuditPressure";
import { Blind } from "../../../gamecharacters/buffs/standard/Blind";

export class RevenantAuditor extends AutomatedCharacter {
    constructor() {
        super({
            name: "Revenant Auditor",
            portraitName: "symbol_head_charon",
            maxHitpoints: 140,
            description: "Deep France Concession Holdings sent this one to reconcile the boundary ledgers, and it has been reconciling them, without pause, since well before the Company had a claim to reconcile. No face under the hood that I could find, only a tally that never stops turning over. Play too busy a hand against it and it docks your dexterity for the trouble, on the grounds - it insists on grounds - that we ought to have filed our intentions in triplicate beforehand. I did not ask what it does to men who fall behind on their own paperwork."
        });
        this.buffs.push(new AuditPressure(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 11, owner: this }).withTitle('Strike Off The Rolls')
            ],
            [
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Blind(1), owner: this }).withTitle('Confiscate The Ledger'),
                new AttackIntent({ baseDamage: 7, owner: this }).withTitle('Confiscate The Ledger')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
