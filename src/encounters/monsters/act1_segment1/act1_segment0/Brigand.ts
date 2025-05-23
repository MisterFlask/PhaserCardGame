import { AbstractIntent, ApplyBuffToSelfIntent, AttackIntent, IntentListCreator } from '../../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../../gamecharacters/AutomatedCharacter';
import { Lethality } from '../../../../gamecharacters/buffs/standard/Lethality';
import { CardSize } from '../../../../gamecharacters/Primitives';
import { TargetingUtils } from '../../../../utils/TargetingUtils';

export class Brigand extends AutomatedCharacter {
    constructor() {
        super({
            name: "Ferryman Brigand",
            portraitName: "ferryman_mutineer",
            maxHitpoints: 20,
            description: "A disgruntled member of the ferryman's union, likely was displaced by the Victoria-Stygian Control Gate."
        });
        this.size = CardSize.LARGE
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 5, owner: this }).withTitle("Shoot")
            ],
            [
                new AttackIntent({ 
                    baseDamage: 3, 
                    owner: this, 
                    target: TargetingUtils.getInstance().selectRandomPlayerCharacter() 
                }).withTitle("Quickfires"),
                new AttackIntent({ 
                    baseDamage: 3, 
                    owner: this, 
                    target: TargetingUtils.getInstance().selectRandomPlayerCharacter() 
                }).withTitle("Quickfires")
            ],
            [
                new ApplyBuffToSelfIntent({ buff: new Lethality(3), owner: this }).withTitle("Clean Barrels")
            ]
        ];

        return IntentListCreator.selectRandomIntents(intents);
    }
}