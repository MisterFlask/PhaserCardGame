import Phaser from 'phaser';
import { PlayableCard } from '../gamecharacters/PlayableCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import { PhysicalCard } from './PhysicalCard';
import { TextBox } from './TextBox';

export class ShopItemPanel {
    public container: Phaser.GameObjects.Container;
    private scene: Phaser.Scene;
    private card: PlayableCard;
    private physicalCard!: PhysicalCard;
    private priceText!: TextBox;
    private isBuyable: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, card: PlayableCard, isBuyable: boolean, onPurchase: (card: PlayableCard) => void) {
        this.scene = scene;
        this.card = card;
        this.isBuyable = isBuyable;
        this.container = this.scene.add.container(x, y);

        this.createPhysicalCard();
        this.createPriceText();
        this.setupInteractivity(onPurchase);
        this.arrangeComponents();
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
        this.container.add(this.physicalCard.container);
    }

    private createPriceText(): void {
        const price = this.isBuyable ? this.card.surfaceValue : this.card.hellValue;
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
        
        this.container.add([this.priceText]);
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
        this.container.removeAll(true);

        // Destroy the container itself
        this.container.destroy();

        // Clear any references
        this.scene = null!;
        this.card = null!;
        this.physicalCard = null!;
        this.priceText = null!;
    }

    private setupInteractivity(onPurchase: (card: PlayableCard) => void): void {
        this.physicalCard.container.setInteractive()
            .on('pointerdown', () => {
                onPurchase(this.card);
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
        this.container.add(alignmentContainer);

        // Set the container size to match the grid
        this.container.setSize(grid.width, grid.height);

        // Update the interactive area
        this.container.input?.hitArea?.setTo(0, 0, grid.width, grid.height);
    }
}
