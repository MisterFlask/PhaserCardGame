// portrait name : Eldritch Soldier Gunner
// Ability: regeneration 3
// alternates between guarding self for 20, and attacking randomly 3 times for 5
// Lumbering (lol)
import { AbstractIntent, AttackAllPlayerCharactersIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Regeneration } from '../../../gamecharacters/buffs/enemy_buffs/Regeneration';
import { CardSize } from '../../../gamecharacters/Primitives';

export class AccursedObelisk extends AutomatedCharacter {
    constructor() {
        super({
            name: "Obelisk of Cups",
            portraitName: "totem_2",
            maxHitpoints: 40,
            description: "BWEEEEOW."
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
                new AttackAllPlayerCharactersIntent({ baseDamage: 10, owner: this }).withTitle("BWEEEOOOOOW BWEEEEOOOW"),
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}
