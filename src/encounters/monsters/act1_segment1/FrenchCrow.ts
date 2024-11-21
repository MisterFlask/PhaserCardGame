//Le Siffleur du Néant
// act 1 segment 1 monster
// imageName: "Eldritch Corruption Crow"

import { AbstractIntent, ApplyBuffToSelfIntent, AttackIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Flying } from '../../../gamecharacters/buffs/standard/Flying';
import { Stressful } from '../../../gamecharacters/buffs/standard/Stressful';
import { Lethality } from '../../../gamecharacters/buffs/standard/Strong';

export class FrenchCrow extends AutomatedCharacter {
    constructor() {
        super({
            name: "Crow",
            portraitName: "Eldritch Corruption Crow",
            maxHitpoints: 10,
            description: "A pest that tends to materialize in the wake of the French cults."
        });
        this.buffs.push(new Flying(1));
        this.buffs.push(new Stressful(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const randomChoice = Math.random();
        
        if (randomChoice < 0.3) {
            // Attack twice for 4
            return [
                new AttackIntent({ baseDamage: 4, owner: this }).withTitle("Peck"),
                new AttackIntent({ baseDamage: 4, owner: this }).withTitle("Peck")
            ];
        } else if (randomChoice < 0.7) {
            // Attack once for 6
            return [new AttackIntent({ baseDamage: 6, owner: this }).withTitle("Void Strike")];
        } else {
            // Buff itself with 2 strength
            return [new ApplyBuffToSelfIntent({ buff: new Lethality(2), owner: this }).withTitle("Eldritch Empowerment")];
        }
    }
}
