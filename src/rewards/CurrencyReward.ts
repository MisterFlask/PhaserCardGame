import { GameState } from '../rules/GameState';
import { AbstractReward, RewardType } from './AbstractReward';

export class CurrencyReward extends AbstractReward {
    public amount: number;

    constructor(amount: number) {
        super(RewardType.HellCurrency);
        this.amount = amount;
    }

    getDisplayText(): string {
        return `${this.amount} Hell Currency`;
    }

    getTooltipText(): string {
        return `Gain ${this.amount} Hell Currency`;
    }

    getIconTexture(): string {
        return 'abstract-047';    
    }

    collect(scene: Phaser.Scene): void {
        GameState.getInstance().hellCurrency += this.amount;
    }
} 