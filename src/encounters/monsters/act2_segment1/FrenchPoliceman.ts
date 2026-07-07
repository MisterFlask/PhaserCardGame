import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Guilt } from '../../../gamecharacters/buffs/enemy_buffs/Guilt';
import { Penance } from '../../../gamecharacters/buffs/enemy_buffs/Penance';
import { Weak } from '../../../gamecharacters/buffs/standard/Weak';

export class FrenchPoliceman extends AutomatedCharacter {
    constructor() {
        super({
            name: "Prévôt des Maréchaux",
            portraitName: "french-policeman-gendarme",
            maxHitpoints: 175,
            description: "The Emperor's military police do not die, exactly, so much as decline to stop working. This one has been checking papers at the same crossroads since - by his own account, delivered at length and in the second person - the winter of some campaign I've never heard of. He knows a deserter by smell, he claims, and fixes each of us with a stare that suggests prior acquaintance with our particular species of cowardice. Rather unnervingly accurate, in my case. Do try to look like you belong to a unit."
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
