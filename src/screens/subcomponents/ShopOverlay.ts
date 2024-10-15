import Phaser from 'phaser';
import { ShopGuy } from '../../encounters/Encounters';
import { AbstractCard } from '../../gamecharacters/AbstractCard';
import { BaseCharacter } from '../../gamecharacters/BaseCharacter';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { Rummage } from '../../gamecharacters/playerclasses/cards/basic/Rummage';
import { GameState } from '../../rules/GameState';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { TextBox } from '../../ui/TextBox';
import { CardGuiUtils } from '../../utils/CardGuiUtils';

export class ShopOverlay {
    private scene: Phaser.Scene;
    private overlay: Phaser.GameObjects.Container;
    private isVisible: boolean = false;
    private cardGuiUtils: CardGuiUtils;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.overlay = this.scene.add.container(0, 0).setVisible(false).setDepth(2000);
        this.cardGuiUtils = CardGuiUtils.getInstance();
        this.createOverlay();
    }

    private createOverlay(): void {
        const { width, height } = this.scene.scale;

        // Create a semi-transparent background
        const background = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        background.setOrigin(0);

        // Create a title
        const title = this.scene.add.text(width / 2, 50, 'Shop', { fontSize: '32px', color: '#ffffff' });
        title.setOrigin(0.5);

        // Create containers for shop items and inventory
        const shopItemsContainer = this.scene.add.container(50, 100);
        const inventoryContainer = this.scene.add.container(width - 300, 100);

        // Add close button
        const closeButton = new TextBox({
            scene: this.scene,
            x: width - 50,
            y: 50,
            width: 40,
            height: 40,
            text: 'X',
            style: { fontSize: '24px', color: '#ffffff' },
            textBoxName: 'closeButton'
        });
        closeButton.setInteractive(true);
        closeButton.background?.on('pointerdown', this.hide.bind(this));

        this.overlay.add([background, title, shopItemsContainer, inventoryContainer, closeButton.background!, closeButton.text]);

        // Populate shop items and inventory
        this.populateShopItems(shopItemsContainer);
        this.populateInventory(inventoryContainer);
    }

    private populateShopItems(container: Phaser.GameObjects.Container): void {
        const shopItems = this.getShopItems();
        shopItems.forEach((item, index) => {
            const physicalCard = this.cardGuiUtils.createCard({
                scene: this.scene,
                x: 0,
                y: index * 180,
                data: item,
                eventCallback: (card: PhysicalCard) => this.buyItem(item)
            });
            
            const priceText = new TextBox({
                scene: this.scene,
                x: physicalCard.container.x + 60,
                y: physicalCard.container.y + 100,
                width: 100,
                height: 30,
                text: `${item.surfaceValue} gold`,
                style: { fontSize: '16px', color: '#ffffff' },
                textBoxName: `priceTag_${item.name}`
            });
            
            container.add([physicalCard.container, priceText.background!, priceText.text]);
        });
    }

    private populateInventory(container: Phaser.GameObjects.Container): void {
        const inventory = GameState.getInstance().inventory;
        inventory.forEach((item, index) => {
            const physicalCard = this.cardGuiUtils.createCard({
                scene: this.scene,
                x: 0,
                y: index * 180,
                data: item,
                eventCallback: (card: PhysicalCard) => this.sellItem(item)
            });
            
            const sellPriceText = new TextBox({
                scene: this.scene,
                x: physicalCard.container.x + 60,
                y: physicalCard.container.y + 100,
                width: 100,
                height: 30,
                text: `Sell: ${item.hellValue} gold`,
                style: { fontSize: '16px', color: '#ffffff' },
                textBoxName: `sellPriceTag_${item.name}`
            });
            
            container.add([physicalCard.container, sellPriceText.background!, sellPriceText.text]);
        });
    }

    private getShopItems(): PlayableCard[] {
        // This method should be implemented to return the list of items for sale
        // For now, we'll return an empty array
        return [new Rummage(), new Rummage(), new Rummage()];
    }

    private buyItem(item: PlayableCard): void {
        // Implement buying logic here
        console.log(`Buying ${item.name}`);
    }

    private sellItem(item: PlayableCard): void {
        // Implement selling logic here
        console.log(`Selling ${item.name}`);
    }

    public show(): void {
        this.overlay.setVisible(true);
        this.isVisible = true;
    }

    public hide(): void {
        this.overlay.setVisible(false);
        this.isVisible = false;
    }

    public toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    public handleCardClick(card: AbstractCard): void {
        console.log('Card clicked (shop handler)');
        if (card instanceof BaseCharacter && card.name == new ShopGuy().name) {
            console.log('Shop clicked');
            this.toggle();
        }
    }
}
