import { AbstractIntent, AttackAllPlayerCharactersIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { AuditPressure } from '../../../gamecharacters/buffs/enemy_buffs/AuditPressure';

export class ZeppelinGrenadier extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Zeppelin Grenadier',
            portraitName: 'Zeppelin Trooper',
            maxHitpoints: 90,
            description: 'A German trooper dropping cryo-grenades from a personal zeppelin.'
        });
        this.buffs.push(new AuditPressure(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 5, owner: this }).withTitle('Frosty Fizzle')
            ],
            [
                new BlockForSelfIntent({ blockAmount: 10, owner: this }).withTitle('Balloon Barricade'),
                new AttackIntent({ baseDamage: 12, owner: this }).withTitle('Zeppelin Zap')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
