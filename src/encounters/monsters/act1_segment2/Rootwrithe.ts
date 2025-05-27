// portrait name : Eldritch Soldier Gunner
// Ability: regeneration 3
// alternates between guarding self for 20, and attacking randomly 3 times for 5
// Lumbering (lol)
import { AbstractIntent, AttackAllPlayerCharactersIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Regeneration } from '../../../gamecharacters/buffs/enemy_buffs/Regeneration';
import { CardSize } from '../../../gamecharacters/Primitives';

export class Rootwrithe extends AutomatedCharacter {
    constructor() {
        super({
            name: "Obelisk of Cups",
            portraitName: "totem_2",
            maxHitpoints: 40,
            description: "Passed through a mangrove grove where the roots seemed to reach for us, though there was no wind. One wrapped around Thomson's ankle - we had to hack him free. Where we cut, the wood bled something dark. The ferrymen won't make camp near these groves, just shake their heads and push on."
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
