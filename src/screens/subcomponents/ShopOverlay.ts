import Phaser from 'phaser';
import { ShopGuy } from '../../encounters/Encounters';
import { AbstractCard } from '../../gamecharacters/AbstractCard';
import { BaseCharacter } from '../../gamecharacters/BaseCharacter';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { Rummage } from '../../gamecharacters/playerclasses/cards/basic/Rummage';
import { GameState } from '../../rules/GameState';

export class ShopOverlay {
    private scene: Phaser.Scene;
    private overlay: Phaser.GameObjects.Container;
    private isVisible: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.overlay = this.scene.add.container(0, 0).setVisible(false);
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
        const closeButton = this.scene.add.text(width - 50, 50, 'X', { fontSize: '24px', color: '#ffffff' });
        closeButton.setInteractive();
        closeButton.on('pointerdown', this.hide.bind(this));

        this.overlay.add([background, title, shopItemsContainer, inventoryContainer, closeButton]);

        // Populate shop items and inventory (to be implemented)
        this.populateShopItems(shopItemsContainer);
        this.populateInventory(inventoryContainer);
    }

    private populateShopItems(container: Phaser.GameObjects.Container): void {
        const shopItems = this.getShopItems();
        shopItems.forEach((item, index) => {
            const itemText = this.scene.add.text(0, index * 30, `${item.name} - ${item.surfaceValue} gold`, { fontSize: '18px', color: '#ffffff' });
            itemText.setInteractive();
            itemText.on('pointerdown', () => this.buyItem(item));
            container.add(itemText);
        });
    }

    private populateInventory(container: Phaser.GameObjects.Container): void {
        const inventory = GameState.getInstance().inventory;
        inventory.forEach((item, index) => {
            const itemText = this.scene.add.text(0, index * 30, `${item.name} - Sell for ${item.hellValue} gold`, { fontSize: '18px', color: '#ffffff' });
            itemText.setInteractive();
            itemText.on('pointerdown', () => this.sellItem(item));
            container.add(itemText);
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
        if (card instanceof BaseCharacter && card.name == new ShopGuy().name) {
            this.toggle();
        }
    }
}
