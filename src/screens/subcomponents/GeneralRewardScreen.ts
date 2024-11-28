import Phaser from 'phaser';
import { AbstractReward } from '../../rewards/AbstractReward';

class GeneralRewardScreen {
    private scene: Phaser.Scene;
    public container: Phaser.GameObjects.Container;
    public rewards: AbstractReward[];
    private rewardElements: Phaser.GameObjects.Container[] = [];
    private shouldShow: boolean = false;

    constructor(scene: Phaser.Scene, rewards: AbstractReward[]) {
        this.scene = scene;
        this.rewards = rewards;
        this.container = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        );
        this.createBackground();
        this.displayRewards();
        this.hide(); // Initially hidden
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

            // Make reward element interactive
            rewardElement.setInteractive({ useHandCursor: true });

            rewardElement.on('pointerup', () => {
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

        }
    }

    public show(): void {
        this.shouldShow = true;
        this.container.setVisible(true);
        this.container.alpha = 0;

        // Disable interactions during fade-in
        this.container.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Container || child instanceof Phaser.GameObjects.Sprite || child instanceof Phaser.GameObjects.Image) {
                child.disableInteractive();
            }
        });

        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Only enable interactions if we still should be showing
                if (this.shouldShow) {
                    this.container.list.forEach(child => {
                        if (child instanceof Phaser.GameObjects.Container || child instanceof Phaser.GameObjects.Sprite || child instanceof Phaser.GameObjects.Image) {
                            child.setInteractive({ useHandCursor: true });
                        }
                    });
                }
            }
        });
    }

    public hide(): void {
        this.shouldShow = false;
        console.log("Hiding general reward screen");
        this.scene.tweens.add({
            targets: this.container,
            alpha: { from: this.container.alpha, to: 0 },
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                if (!this.shouldShow) {  // Only hide if we still should be hidden
                    this.container.setVisible(false);
                }
            }
        });
    }
}

export default GeneralRewardScreen; 