import { AbstractCard, TargetingType } from '../../../../AbstractCard';
import { EntityRarity } from "../../../../EntityRarity";
import { IBaseCharacter } from '../../../../IBaseCharacter';
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
        return `Deal ${this.getDisplayedDamage()} damage.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!targetCard) return;
        if (!targetCard.isBaseCharacter()) return;

        var target = targetCard as unknown as IBaseCharacter

        this.dealDamageToTarget(targetCard);

        if (target.hasBuff(new Burning(1).getDisplayName())) {
            this.dealDamageToTarget(targetCard);
        }
    }
}
