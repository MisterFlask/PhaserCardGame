import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { CombatResourceUsedEvent } from "../../rules/combatresources/AbstractCombatResource";
import { GameState } from "../../rules/GameState";
import { ActionManager } from "../../utils/ActionManager";
import { AbstractRelic } from "../AbstractRelic";

export class EchoHarvest extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.RARE;
        this.stackable = true;
        this.stacks = 1;
    }

    override getDisplayName(): string {
        return "Echo Harvest";
    }

    override getDescription(): string {
        return `Whenever you spend Mettle, duplicate the rightmost card in your hand ${this.getStacksDisplayText()} time${this.stacks === 1 ? '' : 's'}.`;
    }

    override onEvent(event: CombatResourceUsedEvent): void {
        if (event instanceof CombatResourceUsedEvent && event.isMettle()) {
            const rightmostCard = GameState.getInstance().combatState.getRightmostCardInHand();
            if (rightmostCard) {
                for (let i = 0; i < this.stacks; i++) {
                    const duplicatedCard = rightmostCard.Copy();
                    ActionManager.getInstance().createCardToHand(duplicatedCard);
                }
            }
        }
    }
} 