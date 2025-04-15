/*
If retained: lose 2 Dexterity.  Cost 1 to play; draw a card.
*/
import { TargetingType } from "../../AbstractCard";
import { EntityRarity } from "../../EntityRarity";
import { PlayableCard } from "../../PlayableCard";
import { CardType } from "../../Primitives";
import { AbstractBuff } from "../../buffs/AbstractBuff";
import { Dexterity } from "../../buffs/persona/Dexterity";

// Buff that applies the "if retained" effect
class ParanoidBuff extends AbstractBuff {
    constructor() {
        super(1);
        this.isDebuff = true;
    }

    getDisplayName(): string {
        return "Paranoid";
    }

    getDescription(): string {
        return "If retained at end of turn, lose 2 Dexterity.";
    }

    override shouldRetainAfterTurnEnds(): boolean {
        // We don't want this buff to prevent the card from being discarded
        return false;
    }

    onInHandAtEndOfTurn(): void {
        const owner = this.getCardOwner();
        if (owner) {
            this.pulseBuff();
            this.actionManager.applyBuffToCharacter(owner, new Dexterity(-2));
        }
    }
}

export class Paranoid extends PlayableCard {
    constructor() {
        super({
            name: "Paranoid",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new ParanoidBuff());
        this.portraitName = "paranoid-curse";
    }

    override get description(): string {
        return "If retained: lose 2 Dexterity. Draw a card.";
    }

    override InvokeCardEffects(): void {
        // Draw a card
        this.actionManager.drawCards(1);
    }
}