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
            description: "A converted church organ, or the corpse of one, strapped to a gun-carriage and played by something that used to be a man of the cloth. Each hymn triggers a different bank of barrels; he favours the more triumphant registers, unfortunately, and fires accordingly. Rotting badly and does not seem to mind, or notice, or in fact be entirely present - the hands keep time regardless. We are assured by the locals that killing the instrument does rather more good than killing the organist."
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
