import { GameState } from '../rules/GameState';
import { AbstractReward, RewardType } from './AbstractReward';

export class CurrencyReward extends AbstractReward {
    public amount: number;

    constructor(amount: number) {
        super(RewardType.HellCurrency);
        this.amount = amount;
    }

    getDisplayText(): string {
        return `£${this.amount}`;
    }

    getTooltipText(): string {
        return `Gain £${this.amount}`;
    }

    getIconTexture(): string {
        return 'abstract-047';    
    }

    collect(scene: Phaser.Scene): void {
        GameState.getInstance().moneyInVault += this.amount;
    }
} 