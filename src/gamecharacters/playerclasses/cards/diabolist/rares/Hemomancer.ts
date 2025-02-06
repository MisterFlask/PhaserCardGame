import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class Hemomancer extends PlayableCard {
    constructor() {
        super({
            name: "Hemomancer",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return `Double your Blood.  >5 Mettle:  Do it again.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const currentBlood = this.blood.value;
        this.actionManager.modifyBlood(currentBlood);
        if (this.mettle.value > 5) {
            this.actionManager.modifyBlood(currentBlood);
        }
    }
}
