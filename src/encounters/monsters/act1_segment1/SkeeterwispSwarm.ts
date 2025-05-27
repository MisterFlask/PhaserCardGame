import { AbstractIntent, AddCardToPileIntent, AttackIntent, DoSomethingIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { EggLayer } from '../../../gamecharacters/buffs/enemy_buffs/EggLayer';
import { Lethality } from '../../../gamecharacters/buffs/standard/Lethality';
import { Swarm } from '../../../gamecharacters/buffs/standard/Swarm';
import { StingingInsects } from '../../../gamecharacters/statuses/StingingInsects';

export class SkeeterwispSwarm extends AutomatedCharacter {
    constructor() {
        super({
            name: "Skeeterwisp Swarm",
            portraitName: "orange_wisp_swarm",
            maxHitpoints: 35,
            description: "The insects here are beyond description. They swarm at dusk, glowing faintly like St. Elmo's fire. Got caught in a cloud of them near the old Canning & Canning Trading Post ruins.  As if the climate weren't enough."
        });
        this.buffs.push(new Swarm(10));
        this.buffs.push(new EggLayer(2));
        
        this.portraitTargetLargestDimension = 300;
        this.portraitOffsetXOverride = -40
        this.portraitOffsetYOverride = 0
    }

    override generateNewIntents(): AbstractIntent[] {
        const randomChoice = Math.random();
        if (randomChoice < 0.5) {
            // Attack one target for 15 damage
            return [new AttackIntent({ baseDamage: 5, owner: this }).withTitle("Buzz Kill"),
                new AddCardToPileIntent({ cardToAdd: new StingingInsects(), pileName: 'draw', owner: this }).withTitle("Swarm Warning"),
                new AddCardToPileIntent({ cardToAdd: new StingingInsects(), pileName: 'draw', owner: this }).withTitle("Swarm Warning")
            ];
        } else {
            // Heal and buff
            return [
                new DoSomethingIntent({
                    owner: this,
                    action: () => {
                        this.actionManager.heal(this, 10);
                        this.actionManager.applyBuffToCharacter(this, new Lethality(4));
                    },
                    imageName: 'heal'
                }).withTitle("BZZZZZZZ")
            ];
        }

    }
}
