import { AbstractRelic } from '../relics/AbstractRelic';
import { GameState } from '../rules/GameState';
import { AbstractReward, RewardType } from './AbstractReward';

export class RelicReward extends AbstractReward {
    public relic: AbstractRelic;

    constructor(relic: AbstractRelic) {
        super(RewardType.Relic);
        this.relic = relic;
    }

    getDisplayText(): string {
        return `${this.relic.name}`;
    }

    getTooltipText(): string {
        return `Gain ${this.relic.name}`;
    }

    getIconTexture(): string {
        return 'abstract-047';    
    }

    collect(scene: Phaser.Scene): void {
        GameState.getInstance().addRelic(this.relic, scene);
    }
} 