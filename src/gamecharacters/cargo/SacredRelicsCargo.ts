import { TargetingType } from "../AbstractCard";
import { Devil } from "../buffs/standard/Devil";
import { HellSellValue } from "../buffs/standard/HellSellValue";
import { EntityRarity } from "../EntityRarity";
import { PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";


export class SacredRelicsCargo extends PlayableCard {

    constructor() {
        super({
            name: "Sacred Relics Cargo",
            cardType: CardType.ITEM,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.hellPurchaseValue = 40;
        this.surfacePurchaseValue = 20;
        this.baseDamage = 15;
        this.buffs.push(new HellSellValue(50));
    }

    override get description(): string {
        return `Draw a card.  All Devils take ${this.getDisplayedDamage()} damage.  Decrease the ValuableInHell buff on this card by 15.`;
    }

    override InvokeCardEffects(): void {
        this.actionManager.drawCards(1);
        this.forEachEnemy((enemy) => {
            if (enemy.hasBuff(new Devil().getDisplayName())) {
                this.dealDamageToTarget(enemy);
            }
        });
        this.mirrorChangeToCanonicalCard((card) => {
            this.actionManager.applyBuffToCharacterOrCard(card, new HellSellValue(-15));
        });
    }
}
