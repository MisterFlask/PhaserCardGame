import { AshesResource } from '../../../../../rules/combatresources/AshesResource';
import { AbstractCard, TargetingType } from '../../../../AbstractCard';
import type { BaseCharacter } from '../../../../BaseCharacter';
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCardWithHelpers } from '../../../../PlayableCardWithHelpers';
import { CardType } from '../../../../Primitives';
import { Burning } from '../../../../buffs/standard/Burning';
import { ExplosiveFinishCardBuff } from '../../../../buffs/standard/ExplosiveFinishCardBuff';

export class AndThenHeExploded extends PlayableCardWithHelpers {
    constructor() {
        super({
            name: "And Then He Exploded",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseDamage = 8;
        this.baseEnergyCost = 1;
        this.buffs.push(new ExplosiveFinishCardBuff(10));
        this.resourceScalings.push({
            resource: new AshesResource(),
            attackScaling: 4
        })
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage to ALL enemies for each stack of Burning on the target.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!targetCard) return;
        if (!targetCard.isBaseCharacter()) return;

        var target = targetCard as unknown as BaseCharacter
        var damage = this.getBaseDamageAfterResourceScaling() * target.getBuffStacks(new Burning(1).getBuffCanonicalName());

        this.forEachEnemy(enemy => {
            this.dealDamageToTarget(enemy, damage);
        });

    }
}
