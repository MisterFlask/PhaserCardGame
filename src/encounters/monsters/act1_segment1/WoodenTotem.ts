import { AbstractIntent, ApplyBuffToAllEnemyCharactersIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Lethality } from '../../../gamecharacters/buffs/standard/Lethality';

export class WoodenTotem extends AutomatedCharacter {
    constructor() {
        super({
            name: "Wooden Totem",
            portraitName: "totem_1",
            maxHitpoints: 14,
            description: "These things appear wherever the Guild claims precedence.  Probably not worth worrying about."
        });
        
        this.portraitTargetLargestDimension = 150;
        this.portraitOffsetXOverride = -20
        this.portraitOffsetYOverride = 0
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new ApplyBuffToAllEnemyCharactersIntent({ debuff: new Lethality(2), owner: this }).withTitle("Gathering Eldritch Energy")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}
