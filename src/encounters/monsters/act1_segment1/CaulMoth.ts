import { AbstractIntent, AddCardToPileIntent, AttackIntent, DoSomethingIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { EggLayer } from '../../../gamecharacters/buffs/enemy_buffs/EggLayer';
import { Lethality } from '../../../gamecharacters/buffs/standard/Lethality';
import { Swarm } from '../../../gamecharacters/buffs/standard/Swarm';
import { StingingInsects } from '../../../gamecharacters/statuses/StingingInsects';

export class SorrowmothSwarm extends AutomatedCharacter {
    constructor() {
        super({
            name: "Caul-Moth",
            portraitName: "Light Gemstone A",
            maxHitpoints: 35,
            description: "a noble thing, unwound and draped over too many dimensions."
        });
        this.buffs.push(new Swarm(10));
        this.buffs.push(new EggLayer(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        const randomChoice = Math.random();
        if (randomChoice < 0.5) {
            // Attack one target for 15 damage
            return [new AttackIntent({ baseDamage: 5, owner: this }).withTitle("brrrr"),
                new AddCardToPileIntent({ cardToAdd: new StingingInsects(), pileName: 'draw', owner: this }).withTitle("BZZZZZ"),
                new AddCardToPileIntent({ cardToAdd: new StingingInsects(), pileName: 'draw', owner: this }).withTitle("BZZZZZ")
            ];
        } else {
            // Heal and buff
            return [
                new DoSomethingIntent({
                    owner: this,
                    action: () => {
                        this.actionManager.heal(this.owningCharacter!, 10);
                        this.actionManager.applyBuffToCharacter(this.owningCharacter!, new Lethality(4));
                    },
                    imageName: 'heal'
                }).withTitle("recruit")
            ];
        }

    }
}
