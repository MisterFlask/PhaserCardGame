import { AbstractIntent, ApplyBuffToSelfIntent, AttackIntent, IntentListCreator } from '../../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../../gamecharacters/AutomatedCharacter';
import { Lethality } from '../../../../gamecharacters/buffs/standard/Lethality';
import { TargetingUtils } from '../../../../utils/TargetingUtils';

export class Brigand extends AutomatedCharacter {
    constructor() {
        super({
            name: "Brigand",
            portraitName: "symbol_brigand",
            maxHitpoints: 20,
            description: "A contemptible hooligan of Hell's underclass, looking for an easy score."
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 5, owner: this }).withTitle("Slash")
            ],
            [
                new AttackIntent({ 
                    baseDamage: 3, 
                    owner: this, 
                    target: TargetingUtils.getInstance().selectRandomPlayerCharacter() 
                }).withTitle("Wild Swings"),
                new AttackIntent({ 
                    baseDamage: 3, 
                    owner: this, 
                    target: TargetingUtils.getInstance().selectRandomPlayerCharacter() 
                }).withTitle("Wild Swings")
            ],
            [
                new ApplyBuffToSelfIntent({ buff: new Lethality(3), owner: this }).withTitle("Sharpen Blade")
            ]
        ];

        return IntentListCreator.selectRandomIntents(intents);
    }
}