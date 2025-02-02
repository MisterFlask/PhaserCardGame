import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { FearEater } from '../../../gamecharacters/buffs/enemy_buffs/FearEater';
import { Regeneration } from '../../../gamecharacters/buffs/enemy_buffs/Regeneration';
import { Stress } from '../../../gamecharacters/buffs/standard/Stress';
import { Terrifying } from '../../../gamecharacters/buffs/standard/Terrifying';
import { CardSize } from '../../../gamecharacters/Primitives';


export class FrenchCaptain extends AutomatedCharacter {
    constructor() {
        super({
            name: "Captain Elspeth",
            portraitName: "Eldritch Captain",
            maxHitpoints: 300,
            description: "fought in the battle of Les Eaux Silencieuses"
        });
        
        this.buffs.push(new FearEater(1));
        this.buffs.push(new Terrifying(1));
        this.buffs.push(new Regeneration(4));

        this.size = CardSize.LARGE;
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ 
                    baseDamage: 20, 
                    owner: this,
                }).withTitle("The Lash"),
                new ApplyDebuffToAllPlayerCharactersIntent({ 
                    debuff: new Stress(1), 
                    owner: this 
                }).withTitle("Dread Command")
            ],
            [
                new AttackIntent({ 
                    baseDamage: 15, 
                    owner: this,
                }).withTitle("The Law"),

                new AttackIntent({ 
                    baseDamage: 15, 
                    owner: this,
                }).withTitle("The Law"),
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}
