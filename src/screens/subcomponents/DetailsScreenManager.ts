import Phaser from 'phaser';
import type { AbstractCard } from '../../gamecharacters/AbstractCard';
import { IAbstractBuff } from '../../gamecharacters/IAbstractBuff';
import { GameState } from '../../rules/GameState';
import { DepthManager } from '../../ui/DepthManager';

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
        console.log('Details screen is now visible; hovered card:', GameState.getInstance().combatState.cardHoveredOver_transient);
        this.detailsContainer.setVisible(true);
    }

    private hideDetails(): void {
        this.isVisible = false;
        console.log('Details screen is now hidden');    
        this.detailsContainer.setVisible(false);
    }

    public update(hoveredCard?: AbstractCard): void {
        if (!this.isVisible) {
            return;
        }

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
        const nameText = this.scene.add.text(10, 10, card.name, { fontSize: '24px', color: '#ffffff' });
        this.detailsContainer.add(nameText);

        // Add card description
        const descriptionText = this.scene.add.text(10, 50, card.description, {
            fontSize: '18px',
            color: '#ffffff',
            wordWrap: { width: width * 0.28 }
        });
        this.detailsContainer.add(descriptionText);

        // Add buffs
        let buffY = descriptionText.y + descriptionText.height + 20;
        hoveredCard.buffs.forEach((buff: IAbstractBuff, index: number) => {
            
            // Add buff icon
            const iconSize = 32; // Adjust this value to scale the icon as needed
            const buffIcon = this.scene.add.image(10, buffY, buff.imageName)
                .setOrigin(0, 0)
                .setDisplaySize(iconSize, iconSize);
            this.detailsContainer.add(buffIcon);

            // Add buff name and description
            const buffText = this.scene.add.text(50, buffY, `${buff.getName()}: ${buff.getDescription()}`, {
                fontSize: '16px',
                color: '#ffffff',
                wordWrap: { width: width * 0.25 }
            });
            this.detailsContainer.add(buffText);

            buffY += Math.max(buffIcon.displayHeight, buffText.height) + 10;
        });
    }
}
