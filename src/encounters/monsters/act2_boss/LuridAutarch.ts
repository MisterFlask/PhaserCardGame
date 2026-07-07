import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { FearEater } from '../../../gamecharacters/buffs/enemy_buffs/FearEater';
import { Regeneration } from '../../../gamecharacters/buffs/enemy_buffs/Regeneration';
import { Stress } from '../../../gamecharacters/buffs/standard/Stress';
import { Terrifying } from '../../../gamecharacters/buffs/standard/Terrifying';
import { CardSize } from '../../../gamecharacters/Primitives';


export class LuridAutarch extends AutomatedCharacter {
    constructor() {
        super({
            name: "Lurid Autarch",
            portraitName: "moose",
            maxHitpoints: 300,
            description: "We found the throne first - antlered, vast, unmistakably French in its love of gilt - and the thing that sits it only afterward, which I now consider the correct order in which to discover such creatures. It has no lower jaw to speak of, and does not seem to require one; the voice comes from somewhere else entirely, low and constant, and does not stop even when it isn't strictly speaking talking. Wounds close on it faster than we could open them. Its court, such as it is, consists of wooden idols that watch without moving, and it feeds - I am fairly confident of this - on whatever fear those idols happen to be collecting at the time. Morrison suggested a strategic withdrawal. For once I did not argue."
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
                }).withTitle("Black Speech")
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
