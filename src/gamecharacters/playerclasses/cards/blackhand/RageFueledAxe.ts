//Rage-Fueled Axe:  Deals 8 damage.  Do it again for every card that has been exhausted this turn.

import { PlayableCard } from '../../../PlayableCard';
import { BaseCharacter } from '../../../BaseCharacter';
import { TargetingType } from '../../../AbstractCard';
import { AbstractBuff } from '../../../buffs/AbstractBuff';
import { IBaseCharacter } from '../../../IBaseCharacter';
import { GameState } from '../../../../rules/GameState';
import { StressReliefFinisher } from '../../../buffs/standard/StressReliefFinisher';

export class RageFueledAxe extends PlayableCard {
  constructor() {
    super({
      name: 'Rage-Fueled Axe',
      portraitName: 'rage-fueled-axe',
      targetingType: TargetingType.ENEMY,
    });
    this.baseDamage = 8;
    this.energyCost = 1;
    this.buffs.push(new StressReliefFinisher());
  }

  override get description(): string {
    return `Deal ${this.getDisplayedDamage()} damage. FATAL: the party heals 1 stress.`;
  }

  override InvokeCardEffects(target?: BaseCharacter): void {
    this.dealDamageToTarget(target);
  }

}
