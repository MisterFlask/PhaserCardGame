import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackAllPlayerCharactersIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Swarm } from "../../../gamecharacters/buffs/standard/Swarm";
import { Weak } from "../../../gamecharacters/buffs/standard/Weak";

export class SorrowMothSwarm extends AutomatedCharacter {
    constructor() {
        super({
            name: "Sorrow-Moth Swarm",
            portraitName: "sorrowmoth-swarm",
            maxHitpoints: 70,
            description: "A drifting cloud of pale moths that settled over the picquet line at dusk and, within minutes, had every man in the party discussing early retirement. They feed on morale rather than flesh, so far as I can tell, which strikes me as a very French sort of predation. No single moth does much of anything - the danger, as with most swarms and most committees, is entirely a function of their number."
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
