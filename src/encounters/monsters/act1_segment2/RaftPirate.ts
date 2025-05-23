import { AbstractIntent, AttackIntent, ApplyBuffToSelfIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Lethality } from '../../../gamecharacters/buffs/standard/Lethality';
import { CardSize } from '../../../gamecharacters/Primitives';

export class RaftPirate extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Raft Pirate',
            portraitName: 'Pirate',
            maxHitpoints: 22,
            description: 'Opportunist with rusty harpoons.'
        });
        this.size = CardSize.LARGE;
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [new AttackIntent({ baseDamage: 6, owner: this }).withTitle('Harpoon')],
            [new ApplyBuffToSelfIntent({ buff: new Lethality(2), owner: this }).withTitle('Plunder')]
        ];
        return IntentListCreator.selectRandomIntents(intents);
    }
}
