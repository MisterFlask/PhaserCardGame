import { TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { CardRarity, PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";
import { HellSellValue } from "../../../buffs/standard/HellSellValue";
import { ValuableCargo } from "../../../buffs/standard/ValuableCargo";

export class AlcoholCargo extends PlayableCard {
    constructor() {
        super({
            name: "Alcohol Cargo",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.COMMON,
        });
        this.energyCost = 1;
        this.buffs.push(new HellSellValue(40));
        this.buffs.push(new ValuableCargo());
        this.surfacePurchaseValue = 30;
    }

    override get description(): string {
        return `Decrease stress of all allies by 1. Decrease the ValuableInHell buff on this card by 5.`;
    }

    override InvokeCardEffects(): void {
        this.forEachAlly((ally: BaseCharacter) => {
            this.actionManager.relieveStressFromCharacter(ally, 1);
        });
        this.mirrorChangeToCanonicalCard((card) => {    
            this.actionManager.applyBuffToCard(card, new HellSellValue(-5));
        });
    }
}
