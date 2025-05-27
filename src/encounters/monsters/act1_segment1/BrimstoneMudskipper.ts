import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent } from '../../../gamecharacters/AbstractIntent';
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
            description: "The pools here reek of sulphur. Saw what I took for ordinary mudskippers until one leaped clear over our boat - three feet, easy. Their skin blisters and pops in the heat, and they watch you with eyes like hot coals. The ferryman won't eat them, though we're down to ship's biscuit."
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
