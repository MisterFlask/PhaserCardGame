import { PlayableCard } from '../gamecharacters/PlayableCard';
import { AbstractReward, RewardType } from './AbstractReward';

export class CardReward extends AbstractReward {
    public cardSelection: PlayableCard[];

    constructor(cardSelection: PlayableCard[]) {
        super(RewardType.Card);
        this.cardSelection = cardSelection;
    }

    getDisplayText(): string {
        return "Card Reward";
    }

    getTooltipText(): string {
        return "Choose a new card to add to your deck";
    }

    getIconTexture(): string {
        return 'abstract-097';
    }

    collect(scene: Phaser.Scene): void {
        // Collection is handled by the UI through events
        scene.events.emit('cardReward:collected', this);
    }
} 