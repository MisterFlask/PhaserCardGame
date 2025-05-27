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
            description: "Lost Hutchins today. He was washing his face in what seemed a clear pool when they took him. Lampreys, but nothing like the ones in the Thames. These were thick as a man's arm, with too many teeth. They pulled him under before we could react."
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new LeechingBite(3));
    }

    override generateNewIntents(): AbstractIntent[] {
        return [new AttackIntent({ baseDamage: 7, owner: this, target: TargetingUtils.getInstance().selectRandomPlayerCharacter() }).withTitle('Gnaw')];
    }
}
