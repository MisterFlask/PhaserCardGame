import { GameState } from '../rules/GameState';
import { RewardDisplay } from '../ui/RewardDisplay';
import { AbstractReward, RewardType } from './AbstractReward';

export class CurrencyReward extends AbstractReward {
    public amount: number;

    constructor(amount: number) {
        super(RewardType.HellCurrency);
        this.amount = amount;
    }

    createRewardElement(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
        return new RewardDisplay({
            scene,
            x,
            y,
            text: this.getDisplayText(),
            iconTexture: this.getIconTexture(),
            tooltipText: this.getTooltipText(),
            onClick: () => this.collect(scene)
        });
    }

    getDisplayText(): string {
        return `${this.amount} Hell Currency`;
    }

    getTooltipText(): string {
        return `Gain ${this.amount} Hell Currency`;
    }

    getIconTexture(): string {
        return 'hell_currency_icon';
    }

    collect(scene: Phaser.Scene): void {
        GameState.getInstance().hellCurrency += this.amount;
    }
} 