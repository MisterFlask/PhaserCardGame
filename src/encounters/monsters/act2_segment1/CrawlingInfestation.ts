import { AbstractIntent, ApplyBuffToSelfIntent, AttackAllPlayerCharactersIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { GrowingPowerBuff } from "../../../gamecharacters/buffs/standard/GrowingPower";
import { Lethality } from "../../../gamecharacters/buffs/standard/Strong";
import { Swarm } from "../../../gamecharacters/buffs/standard/Swarm";


export class CrawlingInfestation extends AutomatedCharacter {
    constructor() {
        super({
            name: "Solicitor Swarm",
            portraitName: "crawling infestation",
            maxHitpoints: 60,
            description: "countless tiny mandibles clicking in unison, moving as one entity. the swarm is never just one bug, it's many. too many."
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
