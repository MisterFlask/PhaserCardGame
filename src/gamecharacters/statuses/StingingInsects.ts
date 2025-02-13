import { TargetingType } from "../AbstractCard";
import { EntityRarity } from "../EntityRarity";
import { PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";
import { Erratic } from "../buffs/playable_card/Erratic";
import { Painful } from "../buffs/playable_card/Painful";
export class StingingInsects extends PlayableCard {
    constructor(painfulValue: number = 5) {
        super({
            name: "Stinging Insects",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 0;
        this.buffs.push(new Painful(painfulValue));
        this.buffs.push(new Erratic());
    }

    override get description(): string {
        return "Draw a card.";
    }

    override InvokeCardEffects(): void {
        this.actionManager.drawCards(1);
    }
}
