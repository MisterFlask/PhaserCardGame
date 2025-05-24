import { AbstractIntent, AttackAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { DoNotLookAtMe } from '../../../gamecharacters/buffs/enemy_buffs/DoNotLookAtMe';

export class OldGuardGrenadier extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Old Guard Grenadier',
            portraitName: 'Napoleonic Zombie',
            maxHitpoints: 80,
            description: 'Veteran of countless wars, lobbing unstable grenades.'
        });
        this.buffs.push(new DoNotLookAtMe(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 6, owner: this }).withTitle('Grenade Toss')
            ],
            [
                new AttackIntent({ baseDamage: 18, owner: this }).withTitle('Bayonet Charge')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
