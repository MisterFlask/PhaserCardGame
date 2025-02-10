import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackAllPlayerCharactersIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Swarm } from "../../../gamecharacters/buffs/standard/Swarm";
import { Weak } from "../../../gamecharacters/buffs/standard/Weak";

export class SorrowMothSwarm extends AutomatedCharacter {
    constructor() {
        super({
            name: "Sorrow-Moth Swarm",
            portraitName: "Corrupted Fire Dragon",
            maxHitpoints: 70,
            description: "a drifting, jittery cloud of pale wings that feed on hope. their touch saps courage, leaving only weakness."
        });
        this.buffs.push(new Swarm(10));
    }

    override generateNewIntents(): AbstractIntent[] {
        const rnd = Math.random();
        if (rnd < 0.5) {
            // fluttering assault on all players
            return [new AttackAllPlayerCharactersIntent({ baseDamage: 4, owner: this }).withTitle("Winged Scourge")];
        } else {
            // spread weakening dust to everyone
            return [new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Weak(2), owner: this }).withTitle("Dust of Despair")];
        }
    }
}
