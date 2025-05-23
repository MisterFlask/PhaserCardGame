import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { CardSize } from '../../../gamecharacters/Primitives';

export class DisgruntledFerryman extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Disgruntled Ferryman',
            portraitName: 'Drowned Sailor',
            maxHitpoints: 25,
            description: 'Waterlogged demon muttering about fares.'
        });
        this.size = CardSize.LARGE;
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [new BlockForSelfIntent({ blockAmount: 10, owner: this }).withTitle('Old Routines')],
            [new AttackIntent({ baseDamage: 7, owner: this }).withTitle('Oar Smash')]
        ];
        return IntentListCreator.selectRandomIntents(intents);
    }
}
