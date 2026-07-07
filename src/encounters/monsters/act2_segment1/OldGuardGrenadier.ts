import { AbstractIntent, AttackAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Decaying } from '../../../gamecharacters/buffs/enemy_buffs/Decaying';
import { DoNotLookAtMe } from '../../../gamecharacters/buffs/enemy_buffs/DoNotLookAtMe';
import { Minion } from '../../../gamecharacters/buffs/enemy_buffs/Minion';
import { Implacable } from '../../../gamecharacters/buffs/standard/Implacable';

export class OldGuardGrenadier extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Old Guard Grenadier',
            portraitName: 'Napoleonic Zombie',
            maxHitpoints: 80,
            description: "One of the Emperor's original grenadiers, by his uniform buttons anyway, and still marching a campaign that ended, if the histories are to be believed, some eighty years ago. Rusted through at the joints and bayonet alike, he keeps entrenching regardless - digging, refilling, digging again, a man who has forgotten every order except the last one. Threw a grenade at us with the enthusiasm of a much fresher corpse. Best not to look him in the eye; something in there is still keeping count of the years."
        });
        this.buffs.push(new DoNotLookAtMe(1));
        this.buffs.push(new Implacable(1));
        this.buffs.push(new Decaying(2));
        this.buffs.push(new Minion());
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 6, owner: this }).withTitle('Grisly Grenade')
            ],
            [
                new AttackIntent({ baseDamage: 18, owner: this }).withTitle('Bonaparte Bayonet')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
