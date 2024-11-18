import { TargetingType } from '../../../../AbstractCard';
import { BaseCharacter } from '../../../../BaseCharacter';
import { AbstractBuff } from '../../../../buffs/AbstractBuff';
import { Burning } from '../../../../buffs/standard/Burning';
import { IBaseCharacter } from '../../../../IBaseCharacter';
import { PlayableCard } from '../../../../PlayableCard';

export class AxeMeAQuestion extends PlayableCard {
  constructor() {
    super({
      name: 'Axe Me a Question',
      description: '_',
      portraitName: 'axe-question',
      targetingType: TargetingType.ENEMY,
    });
    this.baseDamage = 11;
    this.baseEnergyCost = 2;
    this.buffs.push(new AxeCritBuff());
  }

  override get description(): string {
    return `Deal ${this.getDisplayedDamage()} damage. Crits against Burning enemies.`;
  }

  override InvokeCardEffects(target?: BaseCharacter): void {
    this.dealDamageToTarget(target as BaseCharacter);
  }
}

class AxeCritBuff extends AbstractBuff {
  constructor() {
    super();
    this.imageName = "axe-crit";
    this.stackable = false;
  }

  override getName(): string {
    return "Axe Crit";
  }

  override getDescription(): string {
    return "Crits against Burning targets.";
  }

  override getAdditionalPercentCombatDamageDealtModifier(target?: IBaseCharacter): number {
    if (target && target.buffs.some(buff => buff instanceof Burning)) {
      return 100; // 100% increase in damage, effectively doubling it
    }
    return 0;
  }
}
