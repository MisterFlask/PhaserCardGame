import Phaser from 'phaser';
import { PriceContext } from '../gamecharacters/AbstractCard';
import { AbstractRelic } from '../relics/AbstractRelic';
import { DepthManager } from './DepthManager';
import { PhysicalRelic } from './PhysicalRelic';

export class ShopRelicPanel extends Phaser.GameObjects.Container {
    private relic: AbstractRelic;
    private physicalRelic!: PhysicalRelic;
    private priceContext: PriceContext;

    constructor(
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        relic: AbstractRelic, 
        priceContext: PriceContext, 
        onPurchase: (relic: AbstractRelic) => void
    ) {
        super(scene, x, y);
        this.relic = relic;
        this.priceContext = priceContext;

        this.createPhysicalRelic();
        this.setupInteractivity(onPurchase);
        this.arrangeComponents();

        this.scene.add.existing(this);

        this.setSize(64, 64);
        console.log(`Relic Panel for ${this.relic.getDisplayName()}:`, {
            x: this.x, 
            y: this.y, 
            width: this.width, 
            height: this.height,
            physicalRelicPos: {
                x: this.physicalRelic?.x,
                y: this.physicalRelic?.y
            }
        });

        if (this.physicalRelic) {
            // Let's not modify the display size here since we're using debug rectangles
        }

        const debugRect = scene.add.rectangle(0, 0, this.width, this.height, 0xff0000, 0.2);
        this.add(debugRect);
        debugRect.setOrigin(0);

        this.setDepth(DepthManager.getInstance().SHOP_OVERLAY);
    }

    private createPhysicalRelic(): void {
        
        this.physicalRelic = new PhysicalRelic({
            scene: this.scene,
            x: 0,
            y: 0,
            abstractRelic: this.relic,
            price: this.relic.price,
            baseSize: 64
        });

        this.physicalRelic
            .on('pointerdown', () => {
                console.log('ShopRelicPanel: received pointerdown from PhysicalRelic');
                // emit is already called from physicalrelic
            })
            .on('pointerover', () => {
                console.log('ShopRelicPanel: received pointerover from PhysicalRelic');
                // emit is already called from physicalrelic
            })
            .on('pointerout', () => {
                console.log('ShopRelicPanel: received pointerout from PhysicalRelic');
                // emit is already called from physicalrelic
            });

        this.scene.add.existing(this.physicalRelic);
        this.add(this.physicalRelic);

        console.log('PhysicalRelic created and added to scene:', {
            visible: this.physicalRelic.visible,
            alpha: this.physicalRelic.alpha,
            x: this.physicalRelic.x,
            y: this.physicalRelic.y,
            parent: this.physicalRelic.parentContainer?.constructor.name
        });
    }

    public destroy(): void {
        if (this.physicalRelic) {
            this.physicalRelic.obliterate();
            this.physicalRelic.destroy();
        }

        this.removeAll(true);
        super.destroy();
    }

    public setRelicHoverDepth(depth: number): void {
        this.setDepth(depth);
        if (this.physicalRelic) {
            this.physicalRelic.setDepth(depth);
        }
    }

    private setupInteractivity(onPurchase: (relic: AbstractRelic) => void): void {
        console.log(`setting up interactivity for ${this.relic.getDisplayName()}'s shop item panel`);
        this.setInteractive()
            .on('pointerdown', () => {
                console.log(`pointerdown on ${this.relic.getDisplayName()}'s shop item panel`);
                onPurchase(this.relic);
            })
            .on('pointerover', () => {                
                console.log(`pointerover on ${this.relic.getDisplayName()}'s shop item panel`);
                this.setToTop();
                this.setRelicHoverDepth(DepthManager.getInstance().SHOP_CARD_HOVER);
            })
            .on('pointerout', () => {
                this.setRelicHoverDepth(DepthManager.getInstance().SHOP_OVERLAY);
            });
    }

    private arrangeComponents(): void {
        // Set the container size to match the physical relic
        const width = this.physicalRelic.width;
        const height = this.physicalRelic.height;
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