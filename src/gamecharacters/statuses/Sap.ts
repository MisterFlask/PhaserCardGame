import { ActionManager } from "../../utils/ActionManager";
import { TargetingType } from "../AbstractCard";
import { EntityRarity } from "../EntityRarity";
import { PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";
import { AbstractBuff } from "../buffs/AbstractBuff";
import { RetainBuff } from "../buffs/playable_card/Retain";
import { StickyBuff } from "../buffs/playable_card/Sticky";
// First define the Slowed debuff
export class SlowedBuff extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Slowed";
    }

    override getDescription(): string {
        return `The next ${this.stacks} cards drawn cost 1 more energy.`;
    }

    override onCardDrawn(): void {
        if (this.stacks > 0) {
            this.getOwnerAsPlayableCard()!.baseEnergyCost++;
            this.stacks--;
        }
    }
}

// Then define the Sap card
export class Sap extends PlayableCard {
    constructor() {
        super({
            name: "Sap",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        
        this.baseEnergyCost = 1;
        this.buffs.push(new RetainBuff());
        this.buffs.push(new StickyBuff());
        this.baseMagicNumber = 1; // Number of cards to be slowed
    }

    override get description(): string {
        return `Retain. If retained: apply Slowed ${this.getDisplayedMagicNumber()} to a random character. Exhaust. Draw a card.`;
    }


    override InvokeCardEffects(): void {
        // Draw a card
        ActionManager.getInstance().drawCards(1);
        ActionManager.getInstance().exhaustCard(this);
    }

}
