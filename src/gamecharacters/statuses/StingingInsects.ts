import { TargetingType } from "../AbstractCard";
import { EntityRarity } from "../EntityRarity";
import { PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";
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
    }

    override get description(): string {
        return "Draw a card.";
    }

    override InvokeCardEffects(): void {
        // No effect
    }
}
