// portrait name : Eldritch Soldier Gunner
// Ability: regeneration 3
// alternates between guarding self for 20, and attacking randomly 3 times for 5
// Lumbering (lol)
import { AbstractIntent, AttackAllPlayerCharactersIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Regeneration } from '../../../gamecharacters/buffs/enemy_buffs/Regeneration';

export class AccursedObelisk extends AutomatedCharacter {
    constructor() {
        super({
            name: "Obelisk of Cups",
            portraitName: "Eldritch Corruption Obelisk",
            maxHitpoints: 40,
            description: "An ancient obelisk radiating dark energy."
        });
        
        
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
