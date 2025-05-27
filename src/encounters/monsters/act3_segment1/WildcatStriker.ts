import { AbstractIntent, AddCardToPileIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent, DoSomethingIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Weak } from "../../../gamecharacters/buffs/standard/Weak";
import { Vulnerable } from "../../../gamecharacters/buffs/standard/Vulnerable";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";
import { RevolutionaryFervor } from "../../../gamecharacters/buffs/standard/RevolutionaryFervor";
import { Terrifying } from "../../../gamecharacters/buffs/standard/Terrifying";
import { BrokenGear } from "../../../gamecharacters/statuses/BrokenGear";
import { TargetingUtils } from "../../../utils/TargetingUtils";

export class WildcatStriker extends AutomatedCharacter {
    constructor(){
        super({
            name: 'Wildcat Striker',
            portraitName: 'angry-worker',
            maxHitpoints: 45,
            description: 'An enraged union militant.'
        });
        this.buffs.push(new RevolutionaryFervor(5));
        this.buffs.push(new Terrifying(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 8, owner: this }).withTitle('Picket Line'),
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Weak(1), owner: this })
            ],
            [
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Vulnerable(2), owner: this }).withTitle('Sabotage'),
                new AddCardToPileIntent({ cardToAdd: new BrokenGear(), pileName: 'draw', owner: this }),
                new AddCardToPileIntent({ cardToAdd: new BrokenGear(), pileName: 'draw', owner: this })
            ],
            [
                new DoSomethingIntent({
                    owner: this,
                    imageName: 'round-shield',
                    action: () => {
                        for (const enemy of TargetingUtils.getInstance().selectAllEnemyCharacters()) {
                            this.actionManager.applyBlock({ baseBlockValue: 8, blockSourceCharacter: this, blockTargetCharacter: enemy });
                            this.actionManager.applyBuffToCharacter(enemy, new Lethality(3));
                        }
                    }
                }).withTitle('Solidarity Forever')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
