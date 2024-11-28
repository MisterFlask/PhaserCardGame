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

    abstract createRewardElement(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container;
    abstract collect(scene: Phaser.Scene): void;
    abstract getDisplayText(): string;
    abstract getTooltipText(): string;
    abstract getIconTexture(): string;
} 