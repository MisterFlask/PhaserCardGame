import { AbstractIntent, AttackAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Decaying } from '../../../gamecharacters/buffs/enemy_buffs/Decaying';
import { Minion } from '../../../gamecharacters/buffs/enemy_buffs/Minion';
import { Implacable } from '../../../gamecharacters/buffs/standard/Implacable';

export class MitrailleuseOrganist extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Mitrailleuse Organist',
            portraitName: 'Machine Gunner Demon',
            maxHitpoints: 100,
            description: 'A frenzied gunner pounding a demonic organ that spits bullets.'
        });
        this.buffs.push(new Implacable(1));
        this.buffs.push(new Decaying(2));
        this.buffs.push(new Minion());
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 4, owner: this }).withTitle('Bullet Barcarolle'),
                new AttackAllPlayerCharactersIntent({ baseDamage: 4, owner: this }).withTitle('Bullet Barcarolle'),
                new AttackAllPlayerCharactersIntent({ baseDamage: 4, owner: this }).withTitle('Bullet Barcarolle')
            ],
            [
                new AttackIntent({ baseDamage: 14, owner: this }).withTitle('Fortissimo Finale')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
