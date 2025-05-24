import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Guilt } from '../../../gamecharacters/buffs/enemy_buffs/Guilt';
import { Penance } from '../../../gamecharacters/buffs/enemy_buffs/Penance';
import { Weak } from '../../../gamecharacters/buffs/standard/Weak';

export class FrenchPoliceman extends AutomatedCharacter {
    constructor() {
        super({
            name: "Prévôt des Maréchaux",
            portraitName: "Clockwork Iron Maiden",
            maxHitpoints: 175,
            description: "I See You"
        });
        
        // Apply initial Penance and Guilt buffs
        this.buffs.push(new Penance(1));
        this.buffs.push(new Guilt(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 20, owner: this }).withTitle("Halt, deserter!")
            ],
            [
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Weak(2), owner: this }).withTitle("Crushing Guilt")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}
