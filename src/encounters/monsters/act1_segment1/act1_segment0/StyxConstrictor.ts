// Hellworm: very beginner enemy, similar difficult as Brigand.  randomly swaps between attacking one character and apply Vulnerable and Weak debuffs to a character.    Note we want it to start with Armored (2)

import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent, IntentListCreator } from '../../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../../gamecharacters/AutomatedCharacter';
import { Armored } from '../../../../gamecharacters/buffs/standard/Armored';
import { Vulnerable } from '../../../../gamecharacters/buffs/standard/Vulnerable';
import { Weak } from '../../../../gamecharacters/buffs/standard/Weak';
import { CardSize } from '../../../../gamecharacters/Primitives';
import { TargetingUtils } from '../../../../utils/TargetingUtils';

export class StyxConstrictor extends AutomatedCharacter {
    constructor() {
        super({
            name: "Styx Constrictor",
            portraitName: "symbol_worm",
            maxHitpoints: 20,
            description: "The ground started moving at dawn. Thought it was an earthquake until Thomson screamed. A worm thick as a ship's mast had taken his leg clean off at the knee."
        });
        
        this.size = CardSize.LARGE
        // Start with Armored (2)
        this.buffs.push(new Armored(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ 
                    baseDamage: 6, 
                    owner: this,
                    target: TargetingUtils.getInstance().selectRandomPlayerCharacter()
                }).withTitle("Venomous Strike")
            ],
            [
                new ApplyDebuffToRandomCharacterIntent({ 
                    debuff: new Vulnerable(2), 
                    owner: this 
                }).withTitle("Corroding Spit"),
                new ApplyDebuffToRandomCharacterIntent({ 
                    debuff: new Weak(1), 
                    owner: this 
                }).withTitle("Weakening Toxin")
            ]
        ];

        return IntentListCreator.selectRandomIntents(intents);
    }
}

