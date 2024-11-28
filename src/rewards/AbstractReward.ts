export enum RewardType {
    Card,
    HellCurrency,
    Relic,
    RelicChoice,
}

export abstract class AbstractReward {
    public type: RewardType;

    constructor(type: RewardType) {
        this.type = type;
    }

    abstract collect(scene: Phaser.Scene): void;
    abstract getDisplayText(): string;
    abstract getTooltipText(): string;
    abstract getIconTexture(): string;
} 