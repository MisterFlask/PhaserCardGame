import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

class RevolverExpertBuff extends AbstractBuff {
    private revolverCardsPlayedThisTurn: number = 0;

    constructor() {
        super();
        this.isDebuff = false;
        this.stackable = false;
    }

    override getDisplayName(): string {
        return "Revolver Expert";
    }

    override getDescription(): string {
        return "The first 2 times per turn you play a card with \"Revolver\" in its name, gain 1 energy and draw a card.";
    }

    override onTurnStart(): void {
        this.revolverCardsPlayedThisTurn = 0;
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard): void {
        if (this.revolverCardsPlayedThisTurn < 2 && 
            playedCard.name.toLowerCase().includes("revolver") && 
            playedCard.owningCharacter === this.getOwnerAsCharacter()) {
            this.revolverCardsPlayedThisTurn++;
            this.actionManager.modifyEnergy(1);
            this.actionManager.drawCards(1);
        }
    }
}

export class RevolverExpert extends PlayableCard {
    constructor() {
        super({
            name: "Revolver Expert",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 2;
        this.flavorText = "Knows every revolver on the manifest by serial number and temperament.";
    }

    override get description(): string {
        return "The first 2 times per turn you play a card with \"Revolver\" in its name, gain 1 energy and draw a card.";
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter) return;

        this.actionManager.applyBuffToCharacterOrCard(
            this.owningCharacter,
            new RevolverExpertBuff()
        );
    }
}