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
            description: 'Cables fused with eels spark with stolen messages.'
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new SignalInterference(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        return [new AttackIntent({ baseDamage: 8, owner: this, target: TargetingUtils.getInstance().selectRandomPlayerCharacter() }).withTitle('Shock Bite')];
    }
}
