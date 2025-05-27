import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent } from '../../../gamecharacters/AbstractIntent';
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
            description: "These damned birds stand in the shallows, patient as undertakers. Grey things with long beaks, but their breathing... it's labored, wet. One followed our boat for miles, wheezing with each wingbeat."
        });
        this.size = CardSize.LARGE;
    }

    override generateNewIntents(): AbstractIntent[] {
        if (Math.random() < 0.5) {
            return [new AttackIntent({ baseDamage: 10, owner: this, target: TargetingUtils.getInstance().selectRandomPlayerCharacter() }).withTitle('Fowl Play')];
        }
        return [new ApplyDebuffToRandomCharacterIntent({ debuff: new Blind(5), owner: this }).withTitle('Fowl Smog')];
    }
}
