import { AbstractIntent, ApplyBuffToAllEnemyCharactersIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Lethality } from '../../../gamecharacters/buffs/standard/Lethality';

export class VeilCapacitor extends AutomatedCharacter {
    constructor() {
        super({
            name: "Obelisk of Pentacles",
            portraitName: "totem_1",
            maxHitpoints: 14,
            description: "A small, unsettling totem.  Probably not worth worrying about."
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
