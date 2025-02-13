export enum RewardType {
    Card,
    HellCurrency,
    Relic,
    RelicChoice,
}

export abstract class AbstractReward {
    public type: RewardType;
    public guid: string = this.generateGuid();

    private generateGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    constructor(type: RewardType) {
        this.type = type;
    }

    abstract collect(scene: Phaser.Scene): void;
    abstract getDisplayText(): string;
    abstract getTooltipText(): string;
    abstract getIconTexture(): string;
} 