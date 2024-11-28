import Phaser from 'phaser';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { CardRuleUtils } from '../../rules/CardRuleUtils';
import { TextBoxButton } from '../../ui/Button';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { CardGuiUtils } from '../../utils/CardGuiUtils';

/**
 * Interface for initializing CardRewardScreen with necessary data.
 */
export interface CardRewardScreenData {
    rewards: PlayableCard[];
    scene: Phaser.Scene;
    onSelect: (selectedCard: PlayableCard) => void;
    onSkip: () => void;
    onReroll?: () => void;
}

class CardRewardScreen {
    private scene: Phaser.Scene;
    public container: Phaser.GameObjects.Container;
    public rewards: PlayableCard[];
    private onSelect: (selectedCard: PlayableCard) => void;
    private onSkip: () => void;
    private goToMapButton!: TextBoxButton;
    private isCardSelected: boolean = false;
    private rerollButton!: TextBoxButton;
    private onReroll?: () => void;
    private shouldShow: boolean = false;

    constructor(params: CardRewardScreenData) {
        this.scene = params.scene;
        this.rewards = params.rewards;
        this.onSelect = params.onSelect;
        this.onSkip = params.onSkip;
        this.onReroll = params.onReroll;

        this.container = this.scene.add.container(this.scene.scale.width / 2, this.scene.scale.height / 2);
        this.createBackground();
        this.displayRewardCards();
        this.createActionButtons();
        this.hide(); // Initially hidden
    }

    private createBackground(): void {
        const background = this.scene.add.rectangle(0, 0, 800, 600, 0x000000, 0.8)
            .setOrigin(0.5)
            .setStrokeStyle(4, 0xffffff);
        this.container.add(background);
    }

    public displayRewardCards(): void {
        const cardSpacing = 220;
        const startX = -cardSpacing;
        const yPosition = -100;

        const cardGuiUtils = CardGuiUtils.getInstance(); // Get instance of CardGuiUtils

        this.rewards.forEach((cardReward, index) => {
            const physicalCard = cardGuiUtils.createCard({
                scene: this.scene,
                x: startX + index * cardSpacing,
                y: yPosition,
                data: cardReward,
                onCardCreatedEventCallback: (cardInstance: PhysicalCard) => {
                    cardInstance.container.setInteractive({ useHandCursor: true });
                    cardInstance.container.on('pointerdown', () => {
                        console.log("Card clicked:", cardReward.name);
                        this.isCardSelected = true;
                        this.onSelect(cardReward);
                        this.hide();
                    });
                }
            });

            // Add the physical card to the container
            this.container.add(physicalCard.container);

            // Add owner's name text under the card
            const ownerNameText = this.scene.add.text(
                physicalCard.container.x,
                physicalCard.container.y + physicalCard.container.height / 2 + 20,
                CardRuleUtils.getInstance().deriveOwnerFromCardNativeClass(cardReward).name,
                {
                    fontSize: '16px',
                    color: '#ffffff',
                    fontFamily: 'Arial',
                    align: 'center'
                }
            ).setOrigin(0.5, 0);

            this.container.add(ownerNameText);
        });
    }

    private createActionButtons(): void {
        const buttonText = "Perhaps not";
        this.goToMapButton = new TextBoxButton({
            scene: this.scene,
            x: -100,
            y: 250,
            width: 300,
            height: 50,
            text: buttonText,
            style: { fontSize: '24px', color: '#ffffff', fontFamily: 'Arial', align: 'center' },
            fillColor: 0x007700,
            textBoxName: 'goToMapButton'
        });

        this.goToMapButton
            .onClick(() => {
                console.log("Skip card reward button clicked.");

                this.onSkip();
                this.hide();
            });

        this.rerollButton = new TextBoxButton({
            scene: this.scene,
            x: 100,
            y: 150,
            width: 300,
            height: 50,
            text: "DEBUG: Reroll",
            style: { fontSize: '24px', color: '#ffffff', fontFamily: 'Arial', align: 'center' },
            fillColor: 0x770000,
            textBoxName: 'rerollButton'
        });

        this.rerollButton
            .onClick(() => {
                console.log("Reroll button clicked");
                if (this.onReroll) {
                    this.onReroll(); // actual gameplay logic, not UI logic (which is below)
                    
                    // Clear existing UI elements before displaying new ones
                    this.container.removeAll();
                    this.createBackground(); // Re-create background since we removed it
                    this.displayRewardCards()
                    this.createActionButtons();
                }
            });

        this.container.add([this.goToMapButton, this.rerollButton]);
    }

    public show(): void {
        this.shouldShow = true;
        this.container.setVisible(true);
        this.scene.tweens.add({
            targets: this.container,
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                if (!this.shouldShow) {
                    this.container.setVisible(false);
                    this.container.alpha = 0;
                }
            }
        });
    }

    public hide(): void {
        this.shouldShow = false;
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

export default CardRewardScreen;
