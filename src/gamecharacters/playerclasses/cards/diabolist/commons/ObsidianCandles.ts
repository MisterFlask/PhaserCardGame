// Power: Manufacture an Eldritch Smoke to your hand.  Draw 2 cards.  Cost 2.  Whenever you Sacrifice, manufacture an Eldritch Smoke to your hand.

import { AbstractCombatEvent } from "../../../../../rules/AbstractCombatEvent";
import { DeckLogic } from "../../../../../rules/DeckLogicHelper";
import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs, SacrificeEvent } from "../../../../procs/BasicProcs";
import { EldritchSmoke } from "../tokens/EldritchSmoke";

export class ObsidianCandlesEffect extends AbstractBuff {
    constructor() {
        super();
        this.imageName = "obsidian_candles";
        this.isDebuff = false;
    }

    override onEvent(event: AbstractCombatEvent): void {
        if (event instanceof SacrificeEvent) {
            for (let i = 0; i < this.stacks; i++) {
                BasicProcs.getInstance().ManufactureCardToHand(new EldritchSmoke().withOwner(this.getOwnerAsCharacter()!));
            }
        }
    }

    override getDisplayName(): string {
        return "Obsidian Candles";
    }

    override getDescription(): string {
        return "Whenever you Sacrifice a card, manufacture an Eldritch Smoke to your hand.";
    }

}

export class ObsidianCandles extends PlayableCard {
    constructor() {
        super({
            name: "Obsidian Candles",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 2;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Manufacture an Eldritch Smoke to your hand
        BasicProcs.getInstance().ManufactureCardToHand(new EldritchSmoke().withOwner(this.owningCharacter!));

        // Draw 2 cards
        const gameState = GameState.getInstance();
        const deckLogic = DeckLogic.getInstance();
        deckLogic.drawCards(2);

        // Add the buff to the player
        if (this.owningCharacter) {
            this.actionManager.applyBuffToCharacter(this.owningCharacter, new ObsidianCandlesEffect());
        }
    }

    override get description(): string {
        return `Manufacture an "Eldritch Smoke" to your hand. Draw 2 cards. Whenever you Sacrifice, manufacture an "Eldritch Smoke" to your hand.`;
    }

    override OnPurchase(): void {
        // Logic for when the card is purchased, if needed
    }
}
