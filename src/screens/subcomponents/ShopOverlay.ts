import Phaser from 'phaser';
import { ShopGuy } from '../../encounters/Encounters';
import { AbstractCard } from '../../gamecharacters/AbstractCard';
import { BaseCharacter } from '../../gamecharacters/BaseCharacter';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { Rummage } from '../../gamecharacters/playerclasses/cards/basic/Rummage';
import { GameState } from '../../rules/GameState';
import { ShopItemPanel } from '../../ui/ShopItemPanel';
import { TextBox } from '../../ui/TextBox';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';

export class ShopOverlay {
    private scene: Phaser.Scene;
    private overlay: Phaser.GameObjects.Container;
    private isVisible: boolean = false;
    private shopItemsContainer!: Phaser.GameObjects.Container;
    private inventoryContainer!: Phaser.GameObjects.Container;
    private shopItemPanels: ShopItemPanel[] = [];
    private inventoryItemPanels: ShopItemPanel[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.overlay = this.scene.add.container(0, 0).setVisible(false).setDepth(2000);
        this.createOverlay();
    }

    private createOverlay(): void {
        const { width, height } = this.scene.scale;

        const background = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        background.setOrigin(0);

        const title = this.scene.add.text(width / 2, 50, 'Shop', { fontSize: '32px', color: '#ffffff' });
        title.setOrigin(0.5);

        this.shopItemsContainer = this.scene.add.container(50, 100);
        this.inventoryContainer = this.scene.add.container(width - 300, 100);

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

        // Use the new makeInteractive method
        closeButton.makeInteractive(this.hide.bind(this));

        this.overlay.add([background, title, this.shopItemsContainer, this.inventoryContainer, closeButton]);

        this.populateShopItems();
        this.populateInventory();
    }

    private populateShopItems(): void {
        const shopItems = this.getShopItems();
        shopItems.forEach((item, index) => {
            const panel = new ShopItemPanel(this.scene, 100, index * 200 + 100, item, true, this.buyItem.bind(this));
            this.shopItemsContainer.add(panel.container);
            this.shopItemPanels.push(panel); // Track panel
        });
    }

    private populateInventory(): void {
        const inventory = GameState.getInstance().inventory;
        inventory.forEach((item, index) => {
            const panel = new ShopItemPanel(this.scene, 0, index * 200 + 100, item, false, this.sellItem.bind(this));
            this.inventoryContainer.add(panel.container);
            this.inventoryItemPanels.push(panel); // Track panel
        });
    }

    private getShopItems(): PlayableCard[] {
        // This method should be implemented to return the list of items for sale
        // For now, we'll return an array with three Rummage cards
        return [new Rummage(), new Rummage(), new Rummage()];
    }

    private buyItem(item: PlayableCard): void {
        // Implement buying logic here
        console.log(`Buying ${item.name}`);
        // remove from shop

        
        // After buying, refresh the shop and inventory
        this.refreshShop();
    }

    private sellItem(item: PlayableCard): void {
        // Implement selling logic here
        console.log(`Selling ${item.name}`);
        // After selling, refresh the shop and inventory
        this.refreshShop();
    }

    private refreshShop(): void {
        // Destroy all tracked shop item panels
        this.shopItemPanels.forEach(panel => panel.destroy());
        this.shopItemPanels = [];

        // Destroy all tracked inventory item panels
        this.inventoryItemPanels.forEach(panel => panel.destroy());
        this.inventoryItemPanels = [];

        this.shopItemsContainer.removeAll(true);
        this.inventoryContainer.removeAll(true);

        // Repopulate with updated items
        this.populateShopItems();
        this.populateInventory();
    }

    public show(): void {
        this.overlay.setVisible(true);
        this.isVisible = true;
        UIContextManager.getInstance().setContext(UIContext.SHOP);
    }

    public hide(): void {
        this.overlay.setVisible(false);
        this.isVisible = false;
        UIContextManager.getInstance().setContext(UIContext.COMBAT);
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
