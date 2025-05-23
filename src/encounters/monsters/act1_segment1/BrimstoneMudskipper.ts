import { AbstractIntent, AttackIntent, ApplyDebuffToRandomCharacterIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Poisoned } from '../../../gamecharacters/buffs/standard/Poisoned';
import { CardSize } from '../../../gamecharacters/Primitives';
import { TargetingUtils } from '../../../utils/TargetingUtils';

export class BrimstoneMudskipper extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Brimstone Mudskipper',
            portraitName: 'Salamander',
            maxHitpoints: 20,
            description: 'Once harmless amphibians bloated with pollution.'
        });
        this.size = CardSize.LARGE;
    }

    override generateNewIntents(): AbstractIntent[] {
        if (Math.random() < 0.5) {
            return [new AttackIntent({ baseDamage: 6, owner: this, target: TargetingUtils.getInstance().selectRandomPlayerCharacter() }).withTitle('Toxic Leap')];
        }
        return [new ApplyDebuffToRandomCharacterIntent({ debuff: new Poisoned(2), owner: this }).withTitle('Polluted Slick')];
    }
}
