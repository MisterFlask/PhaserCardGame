// The first time you play a card each turn, manufacture a copy of it into your hand.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";

class MidnightOilBuff extends AbstractBuff {
    private hasTriggeredThisTurn: boolean = false;

    constructor() {
        super();
        this.isDebuff = false;
        this.stackable = false;
    }

    override getDisplayName(): string {
        return "Midnight Oil";
    }

    override getDescription(): string {
        return "The first time you play a card each turn, manufacture a copy of it into your hand.";
    }

    override onTurnStart(): void {
        this.hasTriggeredThisTurn = false;
    }

    onCardPlayed(card: AbstractCard): void {
        if (!this.hasTriggeredThisTurn && card !== this.getOwnerAsPlayableCard()) {
            this.hasTriggeredThisTurn = true;
            const copy = card.Copy()
            BasicProcs.getInstance().ManufactureCardToHand(copy as PlayableCard);
        }
    }
}

export class MidnightOil extends PlayableCard {
    constructor() {
        super({
            name: "Midnight Oil",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 2;
    }

    override get description(): string {
        return "The first time you play a card each turn, manufacture a copy of it into your hand.";
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter) return;
        
        this.actionManager.applyBuffToCharacterOrCard(
            this.owningCharacter,
            new MidnightOilBuff()
        );
    }
}
