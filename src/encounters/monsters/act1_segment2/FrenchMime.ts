import { AbstractIntent, AttackIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { DoNotLookAtMe } from '../../../gamecharacters/buffs/enemy_buffs/DoNotLookAtMe';
import { SelfDestruct } from '../../../gamecharacters/buffs/enemy_buffs/SelfDestruct';
import { TargetingUtils } from '../../../utils/TargetingUtils';

export class FrenchMime extends AutomatedCharacter {
    private turnsUntilSelfDestruct: number = 2;

    constructor() {
        super({
            name: "Le Mime Explosif",
            portraitName: "Eldritch Mime",
            maxHitpoints: 20,
            description: "the white face paint isn’t for show; it's a seal. a binding."
        });
        
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
