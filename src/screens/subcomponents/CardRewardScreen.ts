import Phaser from 'phaser';
import { AbstractCard } from '../../gamecharacters/AbstractCard';
import { PlayerCharacter } from '../../gamecharacters/BaseCharacterClass';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { TextBoxButton } from '../../ui/Button';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { CardGuiUtils } from '../../utils/CardGuiUtils';

/**
 * Interface for initializing CardRewardScreen with necessary data.
 */
export interface CardRewardScreenData {
    rewards: CardReward[];
    scene: Phaser.Scene;
    onSelect: (selectedCard: CardReward) => void;
    onSkip: () => void;
}

class CardRewardScreen {
    private scene: Phaser.Scene;
    public container: Phaser.GameObjects.Container;
    public rewards: CardReward[];
    private onSelect: (selectedCard: CardReward) => void;
    private onSkip: () => void;
    private selectButton!: TextBoxButton;
    private isCardSelected: boolean = false;

    constructor(params: CardRewardScreenData) {
        this.scene = params.scene;
        this.rewards = params.rewards;
        this.onSelect = params.onSelect;
        this.onSkip = params.onSkip;

        this.container = this.scene.add.container(this.scene.scale.width / 2, this.scene.scale.height / 2);
        this.createBackground();
        this.displayRewardCards();
        this.createActionButton();
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
                data: cardReward.card,
                onCardCreatedEventCallback: (cardInstance: PhysicalCard) => {
                    cardInstance.container.setInteractive({ useHandCursor: true });
                    cardInstance.container.on('pointerdown', () => {
                        console.log("Card clicked:", cardReward.card.name);
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
                cardReward.owner.name,
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

    private createActionButton(): void {
        const buttonText = "Go to Map";
        this.selectButton = new TextBoxButton({
            scene: this.scene,
            x: 0,
            y: 250,
            width: 300,
            height: 50,
            text: buttonText,
            style: { fontSize: '24px', color: '#ffffff', fontFamily: 'Arial', align: 'center' },
            fillColor: 0x007700,
            textBoxName: 'goToMapButton'
        });

        this.selectButton
            .onClick(() => {
                console.log("Go to Map button clicked.");
                if (this.rewards.length > 0 && !this.isCardSelected) {
                    console.log("Please select a card before proceeding.");
                    return;
                }
                this.onSkip();
                this.hide();
            });

        this.container.add(this.selectButton);
    }

    public show(): void {
        this.container.setVisible(true);
        this.scene.tweens.add({
            targets: this.container,
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Power2'
        });
    }

    public hide(): void {
        this.scene.tweens.add({
            targets: this.container,
            alpha: { from: 1, to: 0 },
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.container.setVisible(false);
            }
        });
    }
}

export class CardReward{
    card: AbstractCard
    owner: PlayerCharacter

    constructor(card: PlayableCard, owner: PlayerCharacter){
        this.card = card
        this.card.owner = owner
        this.owner = owner
    }
}

export default CardRewardScreen;
