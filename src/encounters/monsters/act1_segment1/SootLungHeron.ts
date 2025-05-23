import { AbstractIntent, AttackIntent, ApplyDebuffToRandomCharacterIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Blind } from '../../../gamecharacters/buffs/standard/Blind';
import { CardSize } from '../../../gamecharacters/Primitives';
import { TargetingUtils } from '../../../utils/TargetingUtils';

export class SootLungHeron extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Soot-Lung Heron',
            portraitName: 'Corrupted Bird',
            maxHitpoints: 18,
            description: 'Wading bird coughing clouds of smog.'
        });
        this.size = CardSize.LARGE;
    }

    override generateNewIntents(): AbstractIntent[] {
        if (Math.random() < 0.5) {
            return [new AttackIntent({ baseDamage: 5, owner: this, target: TargetingUtils.getInstance().selectRandomPlayerCharacter() }).withTitle('Tar Peck')];
        }
        return [new ApplyDebuffToRandomCharacterIntent({ debuff: new Blind(1), owner: this }).withTitle('Smog Cloud')];
    }
}
