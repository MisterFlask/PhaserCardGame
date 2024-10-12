// portrait name : Eldritch Soldier Gunner
// Ability: regeneration 3
// alternates between guarding self for 20, and attacking randomly 3 times for 5
// Lumbering (lol)
import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Regeneration } from '../../../gamecharacters/buffs/enemy_buffs/Regeneration';

export class FrenchLumberjack extends AutomatedCharacter {
    constructor() {
        super({
            name: "Le Bûcheron Robuste",
            portraitName: "Eldritch Soldier Gunner",
            maxHitpoints: 60,
            description: "Too many unsanctioned pine dimensions.  Culling necessary."
        });
        
        // Apply initial Regeneration buff
        this.buffs.push(new Regeneration(3));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new BlockForSelfIntent({ blockAmount: 20, owner: this }).withTitle("Lumbering Guard")
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
