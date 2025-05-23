import { AbstractIntent, AttackAllPlayerCharactersIntent, AttackIntent, IntentListCreator, SummonIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Desirous } from '../../../gamecharacters/buffs/enemy_buffs/Desirous';
import { Idol } from '../../../gamecharacters/buffs/enemy_buffs/Idol';
import { VesperOfMeat } from '../act1_segment1/BrineBast';

export class FrenchRestauranteur extends AutomatedCharacter {
    constructor() {
        super({
            name: "Le Restaurateur",
            portraitName: "Clockwork Slime",
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
                    monsterToSummon: new VesperOfMeat(),
                    owner: this 
                }).withTitle("ON ME!"),

                new AttackIntent({ 
                    baseDamage: 4, 
                    owner: this,
                }).withTitle("Taste Test"),
                new AttackIntent({ 
                    baseDamage: 4, 
                    owner: this,
                }).withTitle("Taste Test"),

            ],
            [
                new AttackAllPlayerCharactersIntent({ 
                    baseDamage: 11, 
                    owner: this,
                }).withTitle("A La Morte")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}
