// portrait name : Eldritch Soldier Gunner
// Ability: regeneration 3
// alternates between guarding self for 20, and attacking randomly 3 times for 5
// Lumbering (lol)
import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Regeneration } from '../../../gamecharacters/buffs/enemy_buffs/Regeneration';
import { CardSize } from '../../../gamecharacters/Primitives';

export class WoodGolem extends AutomatedCharacter {
    constructor() {
        super({
            name: "Rickety Man",
            portraitName: "wood_golem",
            maxHitpoints: 60,
            description: "I thought it mere superstition until I saw it: a giant constructed from ship timber and bound with rope, moving with purpose through the swamp."
        });
        
        this.size = CardSize.LARGE;
        this.portraitTargetLargestDimension = 300;
        this.portraitOffsetXOverride = -40
        this.portraitOffsetYOverride = 0
        // Apply initial Regeneration buff
        this.buffs.push(new Regeneration(3));

    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new BlockForSelfIntent({ blockAmount: 20, owner: this }).withTitle("Lumbering Defense")
            ],
            [
                new AttackIntent({ baseDamage: 5, owner: this }).withTitle("UNSANCTIONED PINE DIMENSION"),
                new AttackIntent({ baseDamage: 5, owner: this }).withTitle("UNSANCTIONED PINE DIMENSION"),
                new AttackIntent({ baseDamage: 5, owner: this }).withTitle("UNSANCTIONED PINE DIMENSION")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}
