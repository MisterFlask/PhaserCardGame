import { TargetingType } from "../../../AbstractCard";
import { Heavy } from "../../../buffs/playable_card/Heavy";
import { HellSellValue } from "../../../buffs/standard/HellSellValue";
import { EntityRarity } from "../../../EntityRarity";
import { PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";


export class CoalCargo extends PlayableCard {
    constructor() {
        super({
            name: "Coal Cargo",
            cardType: CardType.ITEM,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.surfacePurchaseValue = 20;
        this.baseEnergyCost = 1;
        this.buffs.push(new HellSellValue(185));
        this.buffs.push(new Heavy());
    }

    override get description(): string {
        return `Draw 1 card.`;
    }

    override InvokeCardEffects(): void {
        this.actionManager.drawCards(1);
    }
}
