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
            description: "They're not brigands by choice, I think - just men whose expedition went wrong and were abandoned by whoever sent them. The delta's full of such wreckage. They melted back into the marsh when the ferrymen brought out their long guns, but I could feel them watching us for miles after."
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