import Phaser from 'phaser';
import { AbstractCard, PriceContext } from '../../gamecharacters/AbstractCard';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { PlayerCharacter } from '../../gamecharacters/PlayerCharacter';
import { AbstractRelic } from '../../relics/AbstractRelic';
import { GameState, ShopContents } from '../../rules/GameState';
import { DepthManager } from '../../ui/DepthManager';
import { ShopCardPanel } from '../../ui/ShopCardPanel';
import { ShopRelicPanel } from '../../ui/ShopRelicPanel';
import { TextBox } from '../../ui/TextBox';
import { TransientUiState } from '../../ui/TransientUiState';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { ActionManagerFetcher } from '../../utils/ActionManagerFetcher';
import { CampaignBriefStatus } from './CampaignBriefStatus';

export class ShopOverlay {
    private scene: Phaser.Scene;
    private overlay: Phaser.GameObjects.Container;
    private isVisible: boolean = false;
    private shopItemsContainer!: Phaser.GameObjects.Container;
    private inventoryContainer!: Phaser.GameObjects.Container;
    private shopItemPanels: ShopCardPanel[] = [];
    private inventoryItemPanels: ShopCardPanel[] = [];
    private shopRelicPanels: ShopRelicPanel[] = [];
    private readonly BASE_PANEL_DEPTH = DepthManager.getInstance().SHOP_OVERLAY;
    private campaignBriefStatus: CampaignBriefStatus;
    private shopCardsOutline!: Phaser.GameObjects.Rectangle;
    private inventoryOutline!: Phaser.GameObjects.Rectangle;
    private relicsOutline!: Phaser.GameObjects.Rectangle;
    private debugOutlinesVisible: boolean = false;
    private readonly SHOP_BASE_DEPTH = DepthManager.getInstance().SHOP_OVERLAY;
    private readonly HOVER_DEPTH_BOOST = 1000;
    private currentShop: ShopContents = GameState.getInstance().combatShopContents;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.overlay = this.scene.add.container(0, 0)
            .setVisible(false)
            .setDepth(DepthManager.getInstance().SHOP_OVERLAY);
        
        // Create the campaign brief status
        this.campaignBriefStatus = new CampaignBriefStatus(scene, false);
        
        this.createOverlay();
        
        // Add keyboard listener for Control key
        this.scene.input?.keyboard?.on('keydown-CTRL', this.toggleDebugOutlines, this);
    }

    private createOverlay(): void {
        const { width, height } = this.scene.scale;

        const background = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        background.setOrigin(0);

        const title = this.scene.add.text(width / 2, 50, 'Shop', { fontSize: '32px', color: '#ffffff' });
        this.campaignBriefStatus.setPosition(width / 2, title.y + title.height + 30);
        title.setOrigin(0.5);

        // Create debug outlines for each section - initially invisible
        this.shopCardsOutline = this.scene.add.rectangle(50, 100, 600, height - 150, 0xff0000, 0.2);
        this.shopCardsOutline.setStrokeStyle(2, 0xff0000);
        this.shopCardsOutline.setOrigin(0, 0);
        this.shopCardsOutline.setVisible(false);

        this.inventoryOutline = this.scene.add.rectangle(width / 2 - 200, 200, 600, height - 250, 0x00ff00, 0.2);
        this.inventoryOutline.setStrokeStyle(2, 0x00ff00);
        this.inventoryOutline.setOrigin(0, 0);
        this.inventoryOutline.setVisible(false);

        this.relicsOutline = this.scene.add.rectangle(width - 400, 100, 250, height - 150, 0x0000ff, 0.2);
        this.relicsOutline.setStrokeStyle(2, 0x0000ff);
        this.relicsOutline.setOrigin(0, 0);
        this.relicsOutline.setVisible(false);

        this.shopItemsContainer = this.scene.add.container(50, 100)
            .setDepth(this.SHOP_BASE_DEPTH);
        this.inventoryContainer = this.scene.add.container(width / 2 - 200, 200)
            .setDepth(this.SHOP_BASE_DEPTH);

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

        closeButton.makeInteractive(this.hide.bind(this));

        this.overlay.add([
            background, 
            this.shopCardsOutline,
            this.inventoryOutline,
            this.relicsOutline,
            title, 
            this.shopItemsContainer, 
            this.inventoryContainer, 
            closeButton, 
            this.campaignBriefStatus
        ]);

        this.populatePurchasableShopCards();
        this.populatePurchasableShopRelics();
        this.populateSellableInventory();
    }

    private populatePurchasableShopRelics(): void {
        const { width, height } = this.scene.scale;

        const gridColumns = 2;
        const verticalSpacing = 122;
        const horizontalSpacing = 122;
        
        const startX = width - 400;
        const startY = height / 2 - (verticalSpacing * (gridColumns - 1) / 2);

        this.currentShop.shopRelicsForSale.forEach((relic, index) => {
            const row = Math.floor(index / gridColumns);
            const col = index % gridColumns;
            
            const panel = new ShopRelicPanel(
                this.scene,
                startX + col * horizontalSpacing,
                startY + row * verticalSpacing,
                relic,
                PriceContext.HELL_BUY,
                this.buyRelic.bind(this)
            );
            
            this.shopItemsContainer.add(panel);
            panel.setDepth(this.BASE_PANEL_DEPTH);
            this.shopRelicPanels.push(panel);
        });
    }

    private buyRelic(relic: AbstractRelic): void {
        console.log(`Buying relic ${relic.getDisplayName()}`);
        if (ActionManagerFetcher.getActionManager().buyRelicForHellCurrency(relic, relic.price)) {
            // Remove the purchased relic from the shop relics array
            const relicIndex = this.currentShop.shopRelicsForSale.findIndex(shopRelic => shopRelic.getDisplayName() === relic.getDisplayName());
            if (relicIndex !== -1) {
                this.currentShop.shopRelicsForSale.splice(relicIndex, 1);
            }
            
            this.refreshShop();
            
            // Emit game state changes event
            this.scene.events.emit('propagateGameStateChangesToUi');
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

        console.log('Shop items:', shopItems);

        const gridColumns = 3;
        const gridRows = 3;
        const horizontalSpacing = 200;
        const verticalSpacing = 250;
        const startX = 50;
        const startY = 100;

        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridColumns; col++) {
                const index = row * gridColumns + col;
                
                if (index < shopItems.length) {
                    const item = shopItems[index];
                    const panel = new ShopCardPanel(
                        this.scene, 
                        startX + col * horizontalSpacing, 
                        startY + row * verticalSpacing, 
                        item, 
                        true, 
                        this.buyCard.bind(this), 
                        PriceContext.HELL_BUY
                    );
                    this.shopItemsContainer.add(panel);
                    
                    panel.on('pointerover', () => {
                        this.shopItemsContainer.setDepth(this.SHOP_BASE_DEPTH + this.HOVER_DEPTH_BOOST);
                        panel.setDepth(DepthManager.getInstance().SHOP_CARD_HOVER);
                        TransientUiState.getInstance().hoveredCard = panel.physicalCard;
                    });
                    
                    panel.on('pointerout', () => {
                        this.shopItemsContainer.setDepth(this.SHOP_BASE_DEPTH);
                        panel.setDepth(this.BASE_PANEL_DEPTH);
                        TransientUiState.getInstance().hoveredCard = undefined;
                    });
                    
                    this.shopItemPanels.push(panel);
                }
            }
        }
    }

    private populateSellableInventory(): void {
        const inventory = GameState.getInstance().allCardsWithHellSellValue;
        
        const gridColumns = 3;
        const horizontalSpacing = 200;
        const verticalSpacing = 250;
        
        inventory.forEach((item, index) => {
            if (item.finalHellSellValue > 0) {
                const row = Math.floor(index / gridColumns);
                const col = index % gridColumns;
                
                const panel = new ShopCardPanel(
                    this.scene, 
                    col * horizontalSpacing, 
                    row * verticalSpacing + 100, 
                    item, 
                    false, 
                    this.sellItem.bind(this), 
                    PriceContext.HELL_SELL
                );
                
                this.inventoryContainer.add(panel);
                panel.setDepth(this.BASE_PANEL_DEPTH);
                
                panel.on('pointerover', () => {
                    this.inventoryContainer.setDepth(this.SHOP_BASE_DEPTH + this.HOVER_DEPTH_BOOST);
                    panel.setDepth(DepthManager.getInstance().SHOP_CARD_HOVER);
                    TransientUiState.getInstance().hoveredCard = panel.physicalCard;
                });
                
                panel.on('pointerout', () => {
                    this.inventoryContainer.setDepth(this.SHOP_BASE_DEPTH);
                    panel.setDepth(this.BASE_PANEL_DEPTH);
                    TransientUiState.getInstance().hoveredCard = undefined;
                });
                
                this.inventoryItemPanels.push(panel);
            }
        });
    }

    private getShopItems(): PlayableCard[] {
        var cards = this.currentShop.shopCardsForSale;

        // assign each card to a random character of the appropriate class, or if no such character exists, assign it to a random player character
        cards.forEach(card => {
            var character = GameState.getInstance().currentRunCharacters.find((c: PlayerCharacter) => c.characterClass === card.nativeToCharacterClass);
            if (!character) {
                character = GameState.getInstance().currentRunCharacters[Math.floor(Math.random() * GameState.getInstance().currentRunCharacters.length)];
            }
            card.owningCharacter = character;
        });
        return cards;
    }

    private buyCard(item: PlayableCard): void {
        // Implement buying logic here
        console.log(`Buying ${item.name}`);
        // remove from shop
        if (ActionManagerFetcher.getActionManager().buyItemForHellCurrency(item)) { 
            // Remove the purchased item from the shop items array
            const itemIndex = this.currentShop.shopCardsForSale.findIndex(shopItem => shopItem.id === item.id);
            if (itemIndex !== -1) {
                this.currentShop.shopCardsForSale.splice(itemIndex, 1);
            }

            this.populatePurchasableShopCards()
            // After buying, refresh the shop and inventory
            this.refreshShop();
            
            // Emit game state changes event
            this.scene.events.emit('propagateGameStateChangesToUi');
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
        ActionManagerFetcher.getActionManager().sellItemForBrimstoneDistillate(item);
        
        // After selling, refresh the shop and inventory
        this.refreshShop();
        
        // Emit game state changes event
        this.scene.events.emit('propagateGameStateChangesToUi');
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

        // Destroy all tracked relic panels
        this.shopRelicPanels.forEach(panel => panel.destroy());
        this.shopRelicPanels = [];

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
        var shopIsOn = false;
        if (card.tags.includes("shop_combat")) {
            console.log('Shop clicked');
            this.currentShop = GameState.getInstance().combatShopContents;
            shopIsOn = true;
        }
        if (card.tags.includes("shop_sell_imports")) {
            console.log('Import shop clicked');
            this.currentShop = GameState.getInstance().importShopContents;
            shopIsOn = true;
        }
        if (card.tags.includes("shop_buy_exports")) {
            console.log('Cursed goods shop clicked');
            this.currentShop = GameState.getInstance().cursedGoodsShopContents;
            shopIsOn = true;
        }   
        if (shopIsOn) {
            this.refreshShop();
            this.toggle();
        }
    }

    private toggleDebugOutlines(): void {
        this.debugOutlinesVisible = !this.debugOutlinesVisible;
        this.shopCardsOutline.setVisible(this.debugOutlinesVisible);
        this.inventoryOutline.setVisible(this.debugOutlinesVisible);
        this.relicsOutline.setVisible(this.debugOutlinesVisible);
    }

    public destroy(): void {
        // Clean up keyboard listener when overlay is destroyed
        this.scene.input?.keyboard?.off('keydown-CTRL', this.toggleDebugOutlines, this);
    }
}
