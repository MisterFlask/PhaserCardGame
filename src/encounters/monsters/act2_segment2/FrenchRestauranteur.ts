import { AbstractIntent, AttackIntent, IntentListCreator, SummonIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Desirous } from '../../../gamecharacters/buffs/enemy_buffs/Desirous';
import { Idol } from '../../../gamecharacters/buffs/enemy_buffs/Idol';
import { FrenchChef } from '../act1_segment1/FrenchChef';

export class FrenchRestauranteur extends AutomatedCharacter {
    constructor() {
        super({
            name: "Le Restaurateur",
            portraitName: "Eldritch Restaurateur",
            maxHitpoints: 150,
            description: "retains access to the Gastronome Codex"
        });
        
        this.buffs.push(new Idol(1));
        this.buffs.push(new Desirous(1))
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new SummonIntent({ 
                    monsterToSummon: new FrenchChef(),
                    owner: this 
                }).withTitle("ON ME!"),

                new AttackIntent({ 
                    baseDamage: 4, 
                    owner: this,
                }).withTitle("Taste Test"),

                new AttackIntent({ 
                    baseDamage: 15, 
                    owner: this,
                }).withTitle("Culinary Critique"),
            ],
            [
                new AttackIntent({ 
                    baseDamage: 11, 
                    owner: this,
                }).withTitle("Flambé"),

                new AttackIntent({ 
                    baseDamage: 25, 
                    owner: this,
                }).withTitle("A La Morte")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}
