import { AbstractIntent, ApplyBuffToSelfIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Lethality } from '../../../gamecharacters/buffs/standard/Lethality';
import { CardSize } from '../../../gamecharacters/Primitives';

export class RaftPirate extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Raft Pirate',
            portraitName: 'Pirate',
            maxHitpoints: 22,
            description: 'Ambushed by river pirates near Skeleton Bend. Desperate men on makeshift rafts, armed with boat hooks and old service revolvers. Their leader had the bearing of a cashiered officer - you can always tell. They wanted supplies, ammunition, anything tradeable. When we fought them off, I noticed Guild tattoos on several corpses.'
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
