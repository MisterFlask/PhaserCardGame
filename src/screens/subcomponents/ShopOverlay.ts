import Phaser from 'phaser';
import { ShopGuy } from '../../encounters/Encounters';
import { AbstractCard, PriceContext } from '../../gamecharacters/AbstractCard';
import { BaseCharacter } from '../../gamecharacters/BaseCharacter';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { Rummage } from '../../gamecharacters/playerclasses/cards/basic/Rummage';
import { AbstractRelic } from '../../relics/AbstractRelic';
import { CaskOfErrantSouls } from '../../relics/common/CaskOfErrantSouls';
import { FrozenDew } from '../../relics/common/FrozenDew';
import { IronFilings } from '../../relics/common/IronFilings';
import { GameState } from '../../rules/GameState';
import { DepthManager } from '../../ui/DepthManager';
import { ShopItemPanel } from '../../ui/ShopItemPanel';
import { TextBox } from '../../ui/TextBox';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { ActionManagerFetcher } from '../../utils/ActionManagerFetcher';
import { CampaignBriefStatus } from './CampaignBriefStatus';

export class ShopOverlay {
    private scene: Phaser.Scene;
    private overlay: Phaser.GameObjects.Container;
    private isVisible: boolean = false;
    private shopItemsContainer!: Phaser.GameObjects.Container;
    private inventoryContainer!: Phaser.GameObjects.Container;
    private shopItemPanels: ShopItemPanel[] = [];
    private inventoryItemPanels: ShopItemPanel[] = [];
    private readonly BASE_PANEL_DEPTH = DepthManager.getInstance().SHOP_OVERLAY;
    private campaignBriefStatus: CampaignBriefStatus;
    private shopCards: PlayableCard[] = [new Rummage(), new Rummage(), new Rummage()];
    private shopRelics: AbstractRelic[] = [new CaskOfErrantSouls(), new FrozenDew(), new IronFilings()];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.overlay = this.scene.add.container(0, 0)
            .setVisible(false)
            .setDepth(DepthManager.getInstance().SHOP_OVERLAY);
        
        // Create the campaign brief status
        this.campaignBriefStatus = new CampaignBriefStatus(scene);
        
        this.createOverlay();
    }

    private createOverlay(): void {
        const { width, height } = this.scene.scale;

        const background = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        background.setOrigin(0);

        const title = this.scene.add.text(width / 2, 50, 'Shop', { fontSize: '32px', color: '#ffffff' });
        this.campaignBriefStatus.setPosition(width / 2, title.y + title.height + 30);
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

        this.overlay.add([background, title, this.shopItemsContainer, this.inventoryContainer, closeButton, this.campaignBriefStatus]);

        this.populatePurchasableShopCards();
        this.populatePurchasableShopRelics();
        this.populateSellableInventory();
    }

    private populatePurchasableShopRelics(): void {
        const gridColumns = 3;
        const verticalSpacing = 250;
        const horizontalSpacing = 200;
        const startX = 50;
        // Position relics below the cards
        const startY = 850; // Adjust this value based on your layout needs

        this.shopRelics.forEach((relic, index) => {
            const row = Math.floor(index / gridColumns);
            const col = index % gridColumns;
            
            const panel = new ShopItemPanel(
                this.scene,
                startX + col * horizontalSpacing,
                startY + row * verticalSpacing,
                relic,
                true,
                this.buyRelic.bind(this),
                PriceContext.HELL_BUY
            );
            
            this.shopItemsContainer.add(panel);
            panel.setDepth(this.BASE_PANEL_DEPTH);
            this.shopItemPanels.push(panel);
        });
    }

    private buyRelic(relic: AbstractRelic): void {
        console.log(`Buying relic ${relic.name}`);
        if (ActionManagerFetcher.getActionManager().buyItemForHellCurrency(relic)) {
            // Remove the purchased relic from the shop relics array
            const relicIndex = this.shopRelics.findIndex(shopRelic => shopRelic.id === relic.id);
            if (relicIndex !== -1) {
                this.shopRelics.splice(relicIndex, 1);
            }
            
            this.refreshShop();
        } else {
            // Shake animation for insufficient funds
            const campaignBriefStatus = this.campaignBriefStatus;
            if (campaignBriefStatus) {
                this.scene.tweens.add({
                    targets: campaignBriefStatus,
                    x: '+=10',
                    duration: 50,
                    yoyo: true,
                    repeat: 9,
                    ease: 'Sine.easeInOut'
                });
            }
        }
    }

    private populatePurchasableShopCards(): void {
        const shopItems = this.getShopItems();
        const gridColumns = 3;
        const gridRows = 3;
        const horizontalSpacing = 200;
        const verticalSpacing = 250;
        const startX = 50;
        const startY = 100;

        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridColumns; col++) {
                const index = row * gridColumns + col;
                
                // Only create a panel if there's an item available
                if (index < shopItems.length) {
                    const item = shopItems[index];
                    const panel = new ShopItemPanel(
                        this.scene, 
                        startX + col * horizontalSpacing, 
                        startY + row * verticalSpacing, 
                        item, 
                        true, 
                        this.buyItem.bind(this), 
                        PriceContext.HELL_BUY
                    );
                    this.shopItemsContainer.add(panel);
                    panel.setDepth(this.BASE_PANEL_DEPTH);
                    
                    this.shopItemPanels.push(panel);
                }
            }
        }
    }

    private populateSellableInventory(): void {
        const inventory = GameState.getInstance().inventory;
        inventory.forEach((item, index) => {

            if (item.hellSellValue > 0) {
                const panel = new ShopItemPanel(this.scene, 0, index * 200 + 100, item, false, this.sellItem.bind(this), PriceContext.HELL_SELL);
                this.inventoryContainer.add(panel); // Changed from panel.container to panel

                panel.setDepth(this.BASE_PANEL_DEPTH);
                
                // Add hover handlers
                panel.on('pointerover', () => { // Updated to use container's event
                    panel.setDepth(DepthManager.getInstance().SHOP_CARD_HOVER);
                });
                
                panel.on('pointerout', () => { // Updated to use container's event
                    panel.setDepth(this.BASE_PANEL_DEPTH);
                });
                
                this.inventoryItemPanels.push(panel);
            }
        });
    }

    private getShopItems(): PlayableCard[] {
        // This method should be implemented to return the list of items for sale
        // For now, we'll return an array with three Rummage cards
        return this.shopCards;
    }

    private buyItem(item: PlayableCard): void {
        // Implement buying logic here
        console.log(`Buying ${item.name}`);
        // remove from shop
        if (ActionManagerFetcher.getActionManager().buyItemForHellCurrency(item)) { 
            // Remove the purchased item from the shop items array
            const itemIndex = this.shopCards.findIndex(shopItem => shopItem.id === item.id);
            if (itemIndex !== -1) {
                this.shopCards.splice(itemIndex, 1);
            }

            this.populatePurchasableShopCards()
            // After buying, refresh the shop and inventory
            this.refreshShop();
        } else{
            // Get the campaign brief status and shake it to indicate insufficient funds
            const campaignBriefStatus = this.campaignBriefStatus;
            if (campaignBriefStatus) {
                this.scene.tweens.add({
                    targets: campaignBriefStatus,
                    x: '+=10',
                    duration: 50,
                    yoyo: true,
                    repeat: 9, // 10 shakes total (1 second at 50ms per shake)
                    ease: 'Sine.easeInOut'
                });
            }
        }
    }

    private sellItem(item: PlayableCard): void {
        // Implement selling logic here
        console.log(`Selling ${item.name}`);
        ActionManagerFetcher.getActionManager().sellItemForHellCurrency(item);
        
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
        this.populatePurchasableShopCards();
        this.populatePurchasableShopRelics();
        this.populateSellableInventory();
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
