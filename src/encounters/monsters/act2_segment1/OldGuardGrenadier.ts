import { AbstractIntent, AttackAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { DoNotLookAtMe } from '../../../gamecharacters/buffs/enemy_buffs/DoNotLookAtMe';
import { Implacable } from '../../../gamecharacters/buffs/standard/Implacable';
import { Decaying } from '../../../gamecharacters/buffs/enemy_buffs/Decaying';
import { Minion } from '../../../gamecharacters/buffs/enemy_buffs/Minion';

export class OldGuardGrenadier extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Old Guard Grenadier',
            portraitName: 'Napoleonic Zombie',
            maxHitpoints: 80,
            description: 'Veteran of countless wars, lobbing unstable grenades.'
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
