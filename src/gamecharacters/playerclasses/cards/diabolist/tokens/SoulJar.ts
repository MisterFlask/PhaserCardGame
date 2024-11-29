import { DeckLogic } from "../../../../../rules/DeckLogic";
import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { HellSellValue } from "../../../../buffs/standard/HellSellValue";
import { SurfaceSellValue } from "../../../../buffs/standard/SurfaceSellValue";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class SoulJar extends PlayableCard {
    constructor(sellValue: number = 20) {
        super({
            name: "Soul Jar",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.TOKEN,
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new SurfaceSellValue(sellValue));
        this.buffs.push(new HellSellValue(sellValue));
    }

    override get description(): string {
        return `Target enemy gains 1 Weak.  Draw a card. >3 Venture: gain 1 energy.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const deckLogic = DeckLogic.getInstance();
        deckLogic.drawCards(1);
        if (this.venture.value > 3) {
            this.actionManager.gainEnergy(1);
        }
    }
}
