import { AbstractIntent, AttackAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';

export class MitrailleuseOrganist extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Mitrailleuse Organist',
            portraitName: 'Machine Gunner Demon',
            maxHitpoints: 100,
            description: 'A frenzied gunner pounding a demonic organ that spits bullets.'
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 4, owner: this }).withTitle('Burst Fire'),
                new AttackAllPlayerCharactersIntent({ baseDamage: 4, owner: this }).withTitle('Burst Fire'),
                new AttackAllPlayerCharactersIntent({ baseDamage: 4, owner: this }).withTitle('Burst Fire')
            ],
            [
                new AttackIntent({ baseDamage: 14, owner: this }).withTitle('Finale Volley')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
