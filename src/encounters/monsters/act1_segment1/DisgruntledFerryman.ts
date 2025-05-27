import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { CardSize } from '../../../gamecharacters/Primitives';

export class DisgruntledFerryman extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Disgruntled Ferryman',
            portraitName: 'Drowned Sailor',
            maxHitpoints: 25,
            description: "Engaged a ferryman this morning - surly fellow, wouldn't give his name. His hands were like leather and his eyes... well, I've seen that look before in Kabul, in men who'd been too long at their post. He muttered constantly about 'the old ways' and charged me three times the posted rate. When I protested, he simply stared until I paid. These local boatmen have had their monopoly too long, if you ask me."
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
