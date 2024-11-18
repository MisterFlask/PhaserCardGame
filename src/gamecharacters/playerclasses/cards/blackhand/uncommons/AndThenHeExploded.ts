import { AbstractCard, TargetingType } from '../../../../AbstractCard';
import { IBaseCharacter } from '../../../../IBaseCharacter';
import { EntityRarity } from '../../../../PlayableCard';
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
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. If the target has Burning, do it again. Fatal: all enemies gain 10 Burning.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!targetCard) return;
        if (!targetCard.isBaseCharacter()) return;

        var target = targetCard as unknown as IBaseCharacter

        this.dealDamageToTarget(targetCard);

        if (target.hasBuff(new Burning(1).getName())) {
            this.dealDamageToTarget(targetCard);
        }
    }
}
