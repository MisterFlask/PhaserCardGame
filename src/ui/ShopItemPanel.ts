import Phaser from 'phaser';
import { PriceContext } from '../gamecharacters/AbstractCard';
import { PlayableCard } from '../gamecharacters/PlayableCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import { DepthManager } from './DepthManager';
import { PhysicalCard } from './PhysicalCard';

export class ShopItemPanel extends Phaser.GameObjects.Container {
    private card: PlayableCard;
    private physicalCard!: PhysicalCard;
    private isBuyable: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, card: PlayableCard, isBuyable: boolean, onPurchase: (card: PlayableCard) => void, priceContext: PriceContext) {
        super(scene, x, y);
        this.card = card;
        this.isBuyable = isBuyable;

        this.createPhysicalCard(priceContext);
        this.setupInteractivity(onPurchase);
        this.arrangeComponents();

        this.scene.add.existing(this);
    }

    private createPhysicalCard(priceContext: PriceContext): void {
        const cardGuiUtils = CardGuiUtils.getInstance();
        this.physicalCard = cardGuiUtils.createCard({
            scene: this.scene,
            x: 0,
            y: 0,
            data: this.card,
            onCardCreatedEventCallback: () => {}
        });
        this.physicalCard.priceContext = priceContext;
        this.physicalCard.container
            .on('pointerdown', () => this.emit('pointerdown'))
            .on('pointerover', () => this.emit('pointerover'))
            .on('pointerout', () => this.emit('pointerout'));
        this.add(this.physicalCard.container);
    }

    public destroy(): void {
        if (this.physicalCard) {
            this.physicalCard.obliterate();
            this.physicalCard.destroy();
        }

        this.removeAll(true);
        super.destroy();
    }

    public setCardHoverDepth(depth: number): void {
        this.setDepth(depth);
        if (this.physicalCard) {
            this.physicalCard.setDepth(depth);
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
                this.setToTop();
                this.setCardHoverDepth(DepthManager.getInstance().SHOP_CARD_HOVER);
            })
            .on('pointerout', () => {
                this.setCardHoverDepth(DepthManager.getInstance().SHOP_OVERLAY);
            });
    }

    private arrangeComponents(): void {
        // Set the container size to match the physical card
        const width = this.physicalCard.container.width;
        const height = this.physicalCard.container.height;
        this.setSize(width, height);

        // Update the interactive area
        this.input?.hitArea?.setTo(0, 0, width, height);
    }

    public onHoverStart(callback: () => void): void {
        this.on('pointerover', callback);
    }

    public onHoverEnd(callback: () => void): void {
        this.on('pointerout', callback);
    }
}
