import { AbstractIntent, AttackIntent, DoSomethingIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { DoNotLookAtMe } from '../../../gamecharacters/buffs/enemy_buffs/DoNotLookAtMe';
import { SelfDestruct } from '../../../gamecharacters/buffs/enemy_buffs/SelfDestruct';
import { ActionManager } from '../../../utils/ActionManager';
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

        if (this.turnsUntilSelfDestruct <= 0) {
            intents.push(new DoSomethingIntent({
                owner: this,
                action: () => {
                    console.log("Le Mime Explosif is self-destructing!");
                    // for each player character, deal damage
                    for (const character of TargetingUtils.getInstance().selectAllPlayerCharacters()) {
                        ActionManager.getInstance().dealDamage({ baseDamageAmount: 10, target: character, sourceCharacter: this });
                    }
                    this.hitpoints = 0;
                },
                imageName: "explosion"
            }).withTitle("This Part Isn't Silent"));
        } else {
            this.turnsUntilSelfDestruct--;
        }

        return intents;
    }
}
