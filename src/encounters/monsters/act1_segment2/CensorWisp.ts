import { AbstractIntent, AttackIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { DoNotLookAtMe } from '../../../gamecharacters/buffs/enemy_buffs/DoNotLookAtMe';
import { SelfDestruct } from '../../../gamecharacters/buffs/enemy_buffs/SelfDestruct';
import { CardSize } from '../../../gamecharacters/Primitives';
import { TargetingUtils } from '../../../utils/TargetingUtils';

export class EldritchMime extends AutomatedCharacter {
    private turnsUntilSelfDestruct: number = 2;

    constructor() {
        super({
            name: "Censor Wisp",
            portraitName: "wisp_censored",
            maxHitpoints: 15,
            description: "Strange lights in the mist today - pale, drifting things that seemed drawn to conversation. Whenever I tried to discuss our route with the guide, the words would catch in my throat.  Later, I found pages in my journal blacked out, though I swear I never touched them."
        });
        
        this.size = CardSize.LARGE;
        this.portraitTargetLargestDimension = 300;
        this.portraitOffsetXOverride = -40
        this.portraitOffsetYOverride = 0

        this.buffs.push(new DoNotLookAtMe(1));
        this.buffs.push(new SelfDestruct(10, 3));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[] = [
            new AttackIntent({ baseDamage: 5, owner: this, target: TargetingUtils.getInstance().selectRandomPlayerCharacter() }).withTitle("Whisper Collapse"),
            new AttackIntent({ baseDamage: 8, owner: this, target: TargetingUtils.getInstance().selectRandomPlayerCharacter() }).withTitle("Deadly Silence")
        ];

        return intents;
    }
}
