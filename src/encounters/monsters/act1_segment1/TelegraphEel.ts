import { AbstractIntent, AttackIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { SignalInterference } from '../../../gamecharacters/buffs/enemy_buffs/SignalInterference';
import { CardSize } from '../../../gamecharacters/Primitives';
import { TargetingUtils } from '../../../utils/TargetingUtils';

export class TelegraphEel extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Telegraph Eel',
            portraitName: 'Electric Eel',
            maxHitpoints: 30,
            description: 'The Wickham Telegraph Company lost a fortune here trying to run lines through the swamp. Now the eels have taken to the copper - you can see them glowing beneath the water where the cables fell. Got a nasty shock trying to ford a stream.'
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new SignalInterference(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        return [new AttackIntent({ baseDamage: 8, owner: this, target: TargetingUtils.getInstance().selectRandomPlayerCharacter() }).withTitle('Shocker')];
    }
}
