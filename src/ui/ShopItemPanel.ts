import Phaser from 'phaser';
import { PlayableCard } from '../gamecharacters/PlayableCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import { DepthManager } from './DepthManager';
import { PhysicalCard } from './PhysicalCard';
import { TextBox } from './TextBox';

export class ShopItemPanel extends Phaser.GameObjects.Container {
    private card: PlayableCard;
    private physicalCard!: PhysicalCard;
    private priceText!: TextBox;
    private isBuyable: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, card: PlayableCard, isBuyable: boolean, onPurchase: (card: PlayableCard) => void) {
        super(scene, x, y); // Initialize the container
        this.card = card;
        this.isBuyable = isBuyable;

        this.createPhysicalCard();
        this.createPriceText();
        this.setupInteractivity(onPurchase);
        this.arrangeComponents();

        this.scene.add.existing(this); // Add this container to the scene
    }

    private createPhysicalCard(): void {
        const cardGuiUtils = CardGuiUtils.getInstance();
        this.physicalCard = cardGuiUtils.createCard({
            scene: this.scene,
            x: 0,
            y: 0,
            data: this.card,
            onCardCreatedEventCallback: () => {} // We'll handle events in setupInteractivity
        });
        this.physicalCard.container
            .on('pointerdown', () => this.emit('pointerdown'))
            .on('pointerover', () => this.emit('pointerover'))
            .on('pointerout', () => this.emit('pointerout'));
        this.add(this.physicalCard.container);
    }

    private createPriceText(): void {
        const price = this.isBuyable ? this.card.surfacePurchaseValue : this.card.hellPurchaseValue;
        const text = this.isBuyable ? `${price} gold` : `Sell: ${price} gold`;
        
        this.priceText = new TextBox({
            scene: this.scene,
            x: 0,
            y: 0,
            width: 100,
            height: 30,
            text: text,
            style: { fontSize: '16px', color: '#ffffff' },
            textBoxName: `priceTag_${this.card.name}`
        });
        
        this.add(this.priceText);
    }

    public destroy(): void {
        // Destroy the physical card
        if (this.physicalCard) {
            this.physicalCard.obliterate();
            this.physicalCard.destroy();
        }

        // Destroy the price text
        if (this.priceText) {
            this.priceText.destroy();
        }

        // Remove all children from the container
        this.removeAll(true);

        // Destroy the container itself
        super.destroy();
    }

    // Update the setCardHoverDepth method to use the new setDepth function
    public setCardHoverDepth(depth: number): void {
        this.setDepth(depth);
        if (this.physicalCard) {
            this.physicalCard.setDepth(depth);
        }
        // Also set depth for the price text to ensure it stays with the card
        if (this.priceText) {
            this.priceText.setDepth(depth);
        }
    }

    private setupInteractivity(onPurchase: (card: PlayableCard) => void): void {
        console.log(`setting up interactivity for ${this.card.name}'s shop item panel`);
        this.setInteractive()
            .on('pointerdown', () => {
                console.log(`pointerdown on ${this.card.name}'s shop item panel`);
                onPurchase(this.card);
            })
            .on('pointerover', () => {                
                console.log(`pointerover on ${this.card.name}'s shop item panel`);
                this.setToTop(); //todo: why does this work and depth doesn't?
                this.setCardHoverDepth(DepthManager.getInstance().SHOP_CARD_HOVER);
            })
            .on('pointerout', () => {
                this.setCardHoverDepth(DepthManager.getInstance().SHOP_OVERLAY);
            });
    }

    private arrangeComponents(): void {
        // Create a vertical grid for alignment
        const grid = new Phaser.Structs.Size(
            Math.max(this.physicalCard.container.width, this.priceText.width),
            this.physicalCard.container.height + this.priceText.height + 10, // 10px padding
            Phaser.Structs.Size.NONE
        );
        // Create a container to act as our alignment target
        const alignmentContainer = this.scene.add.container(0, 0);
        alignmentContainer.setSize(grid.width, grid.height);

        // Align the physical card to the top of the alignment container
        Phaser.Display.Align.In.TopCenter(this.physicalCard.container, alignmentContainer);

        // Align the price text to the bottom of the alignment container
        Phaser.Display.Align.In.BottomCenter(this.priceText, alignmentContainer);

        // Add the alignment container to our main container
        this.add(alignmentContainer);

        // Set the container size to match the grid
        this.setSize(grid.width, grid.height);

        // Update the interactive area
        this.input?.hitArea?.setTo(0, 0, grid.width, grid.height);
    }

    // Add these methods to the ShopItemPanel class

    public onHoverStart(callback: () => void): void {
        this.on('pointerover', callback);
    }

    public onHoverEnd(callback: () => void): void {
        this.on('pointerout', callback);
    }
}
