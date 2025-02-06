import { TargetingType } from "../../../gamecharacters/AbstractCard";
import { EntityRarity } from "../../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { CardType } from "../../../gamecharacters/Primitives";
import { AbstractBuff } from "../../../gamecharacters/buffs/AbstractBuff";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";
import { ActionManager } from "../../../utils/ActionManager";

class MawSculptureBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = true;
        this.moveToMainDescription = true;
    }

    override getDisplayName(): string {
        return "Hand Destructor";
    }

    override getDescription(): string {
        return "Retained: exhaust the rest of your hand.";
    }

    override onInHandAtEndOfTurn(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (!ownerCard) return;

        // If we're in hand at end of turn, that means we weren't played
        // Exhaust all other cards in hand
        const hand = this.gameState.combatState.currentHand;
        hand.forEach(card => {
            if (card !== ownerCard) {
                this.actionManager.exhaustCard(card);
            }
        });
    }
}

export class MawSculpture extends PlayableCard {
    constructor() {
        super({
            name: "Maw Sculpture",
            cardType: CardType.SKILL,
            targetingType: TargetingType.ALLY,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new MawSculptureBuff());
    }

    override get description(): string {
        return `All allies gain 2 Strength.`;
    }

    override InvokeCardEffects(): void {
        // Apply 2 Strength to all allies
        this.forEachAlly(ally => {
            ActionManager.getInstance().applyBuffToCharacterOrCard(ally, new Lethality(2));
        });
    }
}
