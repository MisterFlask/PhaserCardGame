import { TargetingType } from "../../../AbstractCard";
import { Heavy } from "../../../buffs/playable_card/Heavy";
import { HellSellValue } from "../../../buffs/standard/HellSellValue";
import { CardRarity, PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";


export class CoalCargo extends PlayableCard {
    constructor() {
        super({
            name: "Coal Cargo",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.COMMON,
        });
        this.energyCost = 1;
        this.buffs.push(new HellSellValue(85));
        this.buffs.push(new Heavy());
    }

    override get description(): string {
        return `Draw 1 card.`;
    }

    override InvokeCardEffects(): void {
        this.actionManager.drawCards(1);
    }
}
