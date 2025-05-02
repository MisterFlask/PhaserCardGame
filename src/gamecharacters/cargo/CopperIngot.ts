import { TargetingType } from "../AbstractCard";
import { BaseCharacter } from "../BaseCharacter";
import { HellSellValue } from "../buffs/standard/HellSellValue";
import { EntityRarity } from "../EntityRarity";
import { PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";

export class CopperIngot extends PlayableCard {
    constructor() {
        super({
            name: "Copper Ingot",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.baseDamage = 4;
        this.surfacePurchaseValue = 10;
        this.buffs.push(new HellSellValue(40));
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage.`;
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard) {
            this.dealDamageToTarget(targetCard);
        }
    }
}
