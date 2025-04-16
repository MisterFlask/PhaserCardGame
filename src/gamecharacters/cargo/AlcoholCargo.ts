import { TargetingType } from "../AbstractCard";
import { BaseCharacter } from "../BaseCharacter";
import { EntityRarity } from "../EntityRarity";
import { PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";
import { HellSellValue } from "../buffs/standard/HellSellValue";

export class AlcoholCargo extends PlayableCard {
    constructor() {
        super({
            name: "Alcohol Cargo",
            cardType: CardType.ITEM,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new HellSellValue(40));
        this.surfacePurchaseValue = 30;
    }

    override get description(): string {
        return `Decrease stress of all allies by 2. Decrease the HellSellValue buff on this card by 5.`;
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
