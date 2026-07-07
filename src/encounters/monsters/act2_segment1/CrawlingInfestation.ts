import { AbstractIntent, ApplyBuffToSelfIntent, AttackAllPlayerCharactersIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { GrowingPowerBuff } from "../../../gamecharacters/buffs/standard/GrowingPower";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";
import { Swarm } from "../../../gamecharacters/buffs/standard/Swarm";


export class CrawlingInfestation extends AutomatedCharacter {
    constructor() {
        super({
            name: "Solicitor Swarm",
            portraitName: "swarm_bugs_placeholder",
            maxHitpoints: 60,
            description: "Legal correspondence has a way of multiplying in this trench-line, and I do mean literally. What begins as a single writ-serving beetle becomes, within the hour, a moving carpet of the things, each one smaller than the last but no less litigious. They bite in aggregate rather than individually, which I am told is meant to be a comfort. It is not. Recommend against reading any of the summonses they leave behind; Jenkins did, and now owes a Belgian solicitor eleven pounds for reasons nobody can explain."
        });
        // swarm buff caps damage from any single attack
        this.buffs.push(new Swarm(10));
        this.buffs.push(new GrowingPowerBuff(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        return IntentListCreator.iterateIntents([
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 3, owner: this }).withTitle("Skitter And Bite"),
                new AttackAllPlayerCharactersIntent({ baseDamage: 3, owner: this }).withTitle("Skitter And Bite")
            ],
            [
                new ApplyBuffToSelfIntent({ buff: new Lethality(3), owner: this }).withTitle("Recruit")
            ]
        ]);
    }
}
