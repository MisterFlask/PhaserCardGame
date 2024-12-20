import { EntityRarity } from "../../../gamecharacters/PlayableCard";
import { CardLibrary } from "../../../gamecharacters/playerclasses/cards/CardLibrary";
import { AbstractReward } from "../../../rewards/AbstractReward";
import { CardReward } from "../../../rewards/CardReward";
import { AbstractBuff } from "../AbstractBuff";

export class GuaranteedRareCardReward extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Guaranteed Rare Card";
    }

    override getDescription(): string {
        return "Card rewards contain at least one rare card.";
    }

    override alterRewards(currentRewards: AbstractReward[]): AbstractReward[] {
        return currentRewards.map(reward => {
            if (reward instanceof CardReward) {
                // If there's no rare card in the selection, replace one with a rare
                if (!reward.cardSelection.some(card => card.rarity === EntityRarity.RARE)) {
                    const rareCard = CardLibrary.getInstance().getRandomSelectionOfRelevantClassCards(1, EntityRarity.RARE)[0];
                    reward.cardSelection[0] = rareCard;
                }
            }
            return reward;
        });
    }
} 