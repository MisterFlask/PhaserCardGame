import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { AuditPressure } from '../../../gamecharacters/buffs/enemy_buffs/AuditPressure';
import { Implacable } from '../../../gamecharacters/buffs/standard/Implacable';
import { Decaying } from '../../../gamecharacters/buffs/enemy_buffs/Decaying';

export class ImperialAuditorWraith extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Imperial Auditor-Wraith',
            portraitName: 'Ghost Bureaucrat',
            maxHitpoints: 90,
            description: 'A translucent bureaucrat tallying every misused resource.'
        });
        this.buffs.push(new AuditPressure(1));
        this.buffs.push(new Implacable(1));
        this.buffs.push(new Decaying(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 12, owner: this }).withTitle('Spectral Surcharge')
            ],
            [
                new BlockForSelfIntent({ blockAmount: 10, owner: this }).withTitle('Audit Aegis')
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}
