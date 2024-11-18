//Rage-Fueled Axe:  Deals 8 damage.  Do it again for every card that has been exhausted this turn.

import { TargetingType } from '../../../../AbstractCard';
import { BaseCharacter } from '../../../../BaseCharacter';
import { StressReliefFinisher } from '../../../../buffs/standard/StressReliefFinisher';
import { PlayableCard } from '../../../../PlayableCard';

export class RageFueledAxe extends PlayableCard {
  constructor() {
    super({
      name: 'Rage-Fueled Axe',
      portraitName: 'rage-fueled-axe',
      targetingType: TargetingType.ENEMY,
    });
    this.baseDamage = 8;
    this.baseEnergyCost = 1;
    this.buffs.push(new StressReliefFinisher());
  }

  override get description(): string {
    return `Deal ${this.getDisplayedDamage()} damage.  Deals more damage for each Burning on the target.`;
  }

  override InvokeCardEffects(target?: BaseCharacter): void {
    this.dealDamageToTarget(target);
  }

}
