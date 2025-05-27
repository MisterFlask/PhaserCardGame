import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { ToxicRetaliation } from '../../../gamecharacters/buffs/enemy_buffs/ToxicRetaliation';
import { Poisoned } from '../../../gamecharacters/buffs/standard/Poisoned';
import { CardSize } from '../../../gamecharacters/Primitives';
import { TargetingUtils } from '../../../utils/TargetingUtils';

export class RunoffElemental extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Runoff Elemental',
            portraitName: 'Ooze',
            maxHitpoints: 40,
            description: 'Near the ruins of the Henderson Chemical Works, we encountered... I hardly know how to describe it. A moving mass of liquid that stank of copper and coal tar. It flowed uphill, against nature, leaving dead fish in its wake.  Gave it a wide berth, of course.'
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new ToxicRetaliation(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [new AttackIntent({ baseDamage: 8, owner: this, target: TargetingUtils.getInstance().selectRandomPlayerCharacter() }).withTitle('Corrosive Slam')],
            [new ApplyDebuffToRandomCharacterIntent({ debuff: new Poisoned(3), owner: this }).withTitle('Toxic Wave')]
        ];
        return IntentListCreator.selectRandomIntents(intents);
    }
}
