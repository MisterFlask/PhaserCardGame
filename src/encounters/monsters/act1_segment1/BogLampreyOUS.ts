import { AbstractIntent, AttackIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { LeechingBite } from '../../../gamecharacters/buffs/enemy_buffs/LeechingBite';
import { CardSize } from '../../../gamecharacters/Primitives';
import { TargetingUtils } from '../../../utils/TargetingUtils';

export class BogLampreyOUS extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Bog Lamprey O.U.S.',
            portraitName: 'Horror Worm',
            maxHitpoints: 35,
            description: 'Parasitic horror gorged on spiritual essence.'
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new LeechingBite(3));
    }

    override generateNewIntents(): AbstractIntent[] {
        return [new AttackIntent({ baseDamage: 7, owner: this, target: TargetingUtils.getInstance().selectRandomPlayerCharacter() }).withTitle('Gnaw')];
    }
}
