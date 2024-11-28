import Phaser from 'phaser';
import { AbstractReward } from '../../rewards/AbstractReward';

class GeneralRewardScreen {
    private scene: Phaser.Scene;
    public container: Phaser.GameObjects.Container;
    public rewards: AbstractReward[];
    private rewardElements: Phaser.GameObjects.Container[] = [];

    constructor(scene: Phaser.Scene, rewards: AbstractReward[]) {
        this.scene = scene;
        this.rewards = rewards;
        this.container = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        );
        this.createBackground();
        this.displayRewards();
    }

    private createBackground(): void {
        const background = this.scene.add.rectangle(0, 0, 800, 600, 0x000000, 0.8)
            .setOrigin(0.5)
            .setStrokeStyle(4, 0xffffff);
        this.container.add(background);
    }

    private displayRewards(): void {
        const rewardSpacing = 200;
        const startX = -((this.rewards.length - 1) * rewardSpacing) / 2;

        this.rewards.forEach((reward, index) => {
            const xPosition = startX + index * rewardSpacing;
            const rewardElement = reward.createRewardElement(this.scene, xPosition, 0);
            
            this.container.add(rewardElement);
            this.rewardElements.push(rewardElement);

            rewardElement.on('pointerdown', () => {
                this.removeRewardElement(rewardElement, reward);
            });
        });
    }

    private removeRewardElement(
        rewardElement: Phaser.GameObjects.Container,
        reward: AbstractReward
    ): void {
        this.container.remove(rewardElement);
        rewardElement.destroy();
        this.rewards.splice(this.rewards.indexOf(reward), 1);
        if (this.rewards.length === 0) {
            this.hide();
        }
    }

    public show(): void {
        this.container.setVisible(true);
    }

    public hide(): void {
        this.container.setVisible(false);
    }
}

export default GeneralRewardScreen; 