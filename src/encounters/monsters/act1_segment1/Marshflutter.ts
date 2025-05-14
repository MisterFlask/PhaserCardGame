//Le Siffleur du Néant
// act 1 segment 1 monster
// imageName: "Eldritch Corruption Crow"

import { AbstractIntent, ApplyBuffToSelfIntent, AttackIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Flying } from '../../../gamecharacters/buffs/standard/Flying';
import { Lethality } from '../../../gamecharacters/buffs/standard/Lethality';
import { Terrifying } from '../../../gamecharacters/buffs/standard/Terrifying';

export class FrenchCrow extends AutomatedCharacter {
    constructor() {
        super({
            name: "Marshflutter",
            portraitName: "symbol_bird",
            maxHitpoints: 10,
            description: "it sings, and the choir is made from those who listen."
        });
        
        this.portraitTargetLargestDimension = 300;
        this.portraitOffsetXOverride = -40
        this.portraitOffsetYOverride = 0
        this.buffs.push(new Flying(1));
        this.buffs.push(new Terrifying(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const randomChoice = Math.random();
        
        if (randomChoice < 0.3) {
            return [
                new AttackIntent({ baseDamage: 4, owner: this }).withTitle("Weep"),
                new AttackIntent({ baseDamage: 5, owner: this }).withTitle("Wait")
            ];
        } else if (randomChoice < 0.7) {
            return [new AttackIntent({ baseDamage: 12, owner: this }).withTitle("Sing")];
        } else {
            // Buff itself with 2 strength
            return [new ApplyBuffToSelfIntent({ buff: new Lethality(2), owner: this }).withTitle("Deep Breath")];
        }
    }
}
