import Phaser from 'phaser';
import type { AbstractBuff } from '../../gamecharacters/buffs/AbstractBuff';
import { DepthManager } from '../../ui/DepthManager';
import { TransientUiState } from '../../ui/TransientUiState';
import ImageUtils from '../../utils/ImageUtils';

export class DetailsScreenManager {
    private scene: Phaser.Scene;
    private detailsContainer: Phaser.GameObjects.Container;
    private isVisible: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.detailsContainer = this.scene.add.container(0, 0)
            .setVisible(false)
            .setDepth(DepthManager.getInstance().DETAILS_OVERLAY);
        this.setupKeyboardListener();
    }

    private setupKeyboardListener(): void {
        this.scene.input.keyboard?.on('keydown-SHIFT', this.showDetails, this);
        this.scene.input.keyboard?.on('keyup-SHIFT', this.hideDetails, this);
    }

    private showDetails(): void {
        this.isVisible = true;
        console.log('Details screen is now visible; hovered card:', TransientUiState.getInstance().hoveredCard);
        this.detailsContainer.setVisible(true);
    }

    private hideDetails(): void {
        this.isVisible = false;
        console.log('Details screen is now hidden');    
        this.detailsContainer.setVisible(false);
    }

    public update(): void {
        if (!this.isVisible) {
            return;
        }
        var hoveredCard = TransientUiState.getInstance().hoveredCard;

        if (!hoveredCard) {
            this.detailsContainer.removeAll(true);
            console.log('No hovered card');
            return;
        }

        const card = hoveredCard;
        const { width, height } = this.scene.scale;

        // Create background
        const background = this.scene.add.rectangle(0, 0, width * 0.3, height, 0x000000, 0.8)
            .setOrigin(0, 0);
        this.detailsContainer.add(background);

        // Add card name
        const nameText = this.scene.add.text(10, 10, card.data.name, { fontSize: '24px', color: '#ffffff' });
        this.detailsContainer.add(nameText);

        // Add portrait
        const portraitWidth = width * 0.15; // Make portrait width 25% of screen width
        const portraitTexture = this.scene.textures.get(card.data.getEffectivePortraitName(this.scene));
        const originalRatio = portraitTexture.source[0].height / portraitTexture.source[0].width;
        const portraitHeight = portraitWidth * originalRatio;
        
        const portrait = this.scene.add.image(100, nameText.y + nameText.height + 10, card.data.getEffectivePortraitName(this.scene))
            .setOrigin(0, 0)
            .setDisplaySize(portraitWidth, portraitHeight)
            .setTint(card.data.getEffectivePortraitTint(this.scene));
        this.detailsContainer.add(portrait);

        // Add card description (now below portrait)
        const descriptionText = this.scene.add.text(10, portrait.y + portraitHeight + 10, card.data.description, {
            fontSize: '18px',
            color: '#ffffff',
            wordWrap: { width: width * 0.28 }
        });
        this.detailsContainer.add(descriptionText);

        // Add buffs (adjusted Y position to account for portrait)
        let buffY = descriptionText.y + descriptionText.height + 20;
        hoveredCard.data.buffs.forEach((buff: AbstractBuff, index: number) => {
            
            // Add buff icon
            const iconSize = 32; // Adjust this value to scale the icon as needed
            const buffIcon = this.scene.add.image(10, buffY, this.getEffectiveImage(buff))
                .setOrigin(0, 0)
                .setDisplaySize(iconSize, iconSize);
            if (this.isUsingRandomizedImage(buff)){
                buffIcon.setTint(this.getEffectiveRandomizedColor(buff));
            }
            this.detailsContainer.add(buffIcon);

            // Add buff name and description
            const buffText = this.scene.add.text(50, buffY, `${buff.getName()} [${buff.stacks}]: ${buff.getDescription()}`, {
                fontSize: '16px',
                color: '#ffffff',
                wordWrap: { width: width * 0.25 }
            });
            this.detailsContainer.add(buffText);

            buffY += Math.max(buffIcon.displayHeight, buffText.height) + 10;
        });

        // Add card type at the bottom
        const cardTypeText = this.scene.add.text(10, buffY + 10, `Type: ${hoveredCard.data.cardType} , Targeting:  ${hoveredCard.data.asPlayableCard()?.targetingType ?? "No targeting type found"}`, {
            fontSize: '16px',
            color: '#aaaaaa',
            wordWrap: { width: width * 0.28 }
        });
        this.detailsContainer.add(cardTypeText);

    }

    private isUsingRandomizedImage(buff: AbstractBuff): boolean {
        return !this.scene.textures.exists(buff.imageName);
    }

    private getEffectiveImage(buff: AbstractBuff): string {
        return this.scene.textures.exists(buff.imageName) 
            ? buff.imageName 
            : ImageUtils.getDeterministicAbstractPlaceholder(buff.getName());
    }

    private getEffectiveRandomizedColor(buff: AbstractBuff): number {
        return buff.generateSeededRandomBuffColor();
    }
}
