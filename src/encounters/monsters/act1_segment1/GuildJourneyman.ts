// Open Purse: The first two turns of combat, Rob The Boatman is added to your hand.  It it ethereal/exhaust and gives you 10 hell currency.

// alternates between attacking all vs attacking one with an ability called Concuss (2 damage, apply stun 1 (stun ))

import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { StunnedBuff } from '../../../gamecharacters/buffs/playable_card/Stunned';
import { TargetingUtils } from '../../../utils/TargetingUtils';

export class GuildJourneyman extends AutomatedCharacter {
    constructor() {
        super({
            name: "Guild Journeyman",
            portraitName: "symbol_brigand", // Using brigand symbol as placeholder
            maxHitpoints: 35,
            description: ""
        });
        
        this.portraitTargetLargestDimension = 300;
        this.portraitOffsetXOverride = -40;
        this.portraitOffsetYOverride = 0;
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 4, owner: this }).withTitle("Wide Strike")
            ],
            [
                new AttackIntent({ 
                    baseDamage: 2, 
                    owner: this,
                    target: TargetingUtils.getInstance().selectRandomPlayerCharacter()
                }).withTitle("Concuss"),
                new ApplyDebuffToRandomCharacterIntent({ 
                    debuff: new StunnedBuff(1), 
                    owner: this 
                }).withTitle("Concuss")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}