import { EncounterManager } from '../../encounters/Encounters';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { AlcoholCargo } from '../../gamecharacters/playerclasses/cards/cargo/AlcoholCargo';
import { CoffeeCargo } from '../../gamecharacters/playerclasses/cards/cargo/CoffeeCargo';
import { SacredRelicsCargo } from '../../gamecharacters/playerclasses/cards/cargo/SacredRelicsCargo';
import { SpicyLiteratureCargo } from '../../gamecharacters/playerclasses/cards/cargo/SpicyLiteratureCargo';
import { GameState } from '../../rules/GameState';
import { TextBoxButton } from '../../ui/Button';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { CardGuiUtils } from '../../utils/CardGuiUtils';
import { SceneChanger } from '../SceneChanger';
import CampaignScene from './Campaign';

export class InventoryScreen {
    private scene: CampaignScene;
    private shopCards: PhysicalCard[] = [];
    private embarkButton!: TextBoxButton;
    private shopY: number;

    constructor(scene: CampaignScene) {
        this.scene = scene;
        this.shopY = scene.scale.height * 0.5;
        this.createLayout();
    }

    createLayout() {
        this.createShop();
        this.createEmbarkButton();
    }

    private createEmbarkButton() {
        this.embarkButton = new TextBoxButton({
            scene: this.scene,
            x: this.scene.scale.width * 0.95,
            y: this.scene.scale.height * 0.5,
            width: 120,
            height: 40,
            text: 'Embark!',
            style: {
                fontSize: '24px',
                color: '#ffffff',
            },
            fillColor: 0x4a4a4a,
        })
        .setOrigin(0.5)
        .onClick(this.onEmbarkClicked.bind(this));

        this.scene.add.existing(this.embarkButton);
    }

    private createShop() {
        const shopItems = GameState.getInstance().getShopItems();
        if (shopItems.length === 0) {
            // Initialize shop items only if empty
            GameState.getInstance().setShopItems([
                new CoffeeCargo(),
                new AlcoholCargo(),
                new SacredRelicsCargo(),
                new CoffeeCargo(),
                new SpicyLiteratureCargo()
            ]);
        }
        this.positionShopCards(GameState.getInstance().getShopItems());
    }

    private positionShopCards(shopItems: PlayableCard[]) {
        this.shopCards.forEach(card => {
            card.container.removeAllListeners();
            card.destroy();
        });
        this.shopCards = [];

        const { width } = this.scene.scale;
        const cardWidth = width * 0.1;
        const cardSpacing = width * 0.01;
        const startX = (width - (shopItems.length * (cardWidth + cardSpacing))) / 2;

        shopItems.forEach((item, index) => {
            const x = startX + index * (cardWidth + cardSpacing);
            const physicalCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: x,
                y: this.shopY,
                data: item,
                onCardCreatedEventCallback: (card) => this.setupShopCardEvents(card)
            });
            this.shopCards.push(physicalCard);
        });
    }

    private setupShopCardEvents(card: PhysicalCard): void {
        card.container.removeAllListeners();
        
        const originalX = card.container.x;
        const originalY = card.container.y;
        
        card.container.setInteractive({ draggable: true })
            .on('dragstart', () => {
                card.container.setScale(1.1);
                this.scene.children.bringToTop(card.container);
            })
            .on('drag', (pointer: Phaser.Input.Pointer) => {
                const localPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
                card.container.x = localPoint.x;
                card.container.y = localPoint.y;
            })
            .on('dragend', (pointer: Phaser.Input.Pointer) => {
                card.container.setScale(1);
                this.handleShopCardDrop(card, pointer);
            });
    }

    private handleShopCardDrop(card: PhysicalCard, pointer: Phaser.Input.Pointer) {
        // Handle dropping shop items onto characters
        // This would need to be coordinated with the character slots
        // You might want to expose a method to get character slots from CharacterSelectScreen
    }

    private onEmbarkClicked = () => {
        const selectedShopCards = this.shopCards.filter(card => card.container.getData('isSelected'));
        
        // Update the GameState with purchased items
        const gameState = GameState.getInstance();

        // Add purchased items to inventory
        selectedShopCards.forEach(card => {
            if (card.data instanceof PlayableCard) {
                gameState.addToInventory(card.data);
            }
        });

        // Remove purchased items from shop
        gameState.setShopItems(gameState.getShopItems()
            .filter(item => !selectedShopCards.some(card => card.data === item)));

        GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
        
        // Switch to the combat scene
        SceneChanger.switchToCombatScene({ 
            encounter: EncounterManager.getInstance().getShopEncounter().data 
        });
    }

    private showPurchaseEffect(x: number, y: number) {
        const particles = this.scene.add.particles(x, y, 'particle', {
            speed: { min: -100, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            quantity: 1,
            frequency: 25,
            duration: 500
        });

        this.scene.time.delayedCall(500, () => {
            particles.destroy();
        });
    }

    hide() {
        this.shopCards.forEach(card => card.container.setVisible(false));
        this.embarkButton.setVisible(false);
    }

    show() {
        this.shopCards.forEach(card => card.container.setVisible(true));
        this.embarkButton.setVisible(true);
    }

    resize() {
        const { width, height } = this.scene.scale;
        this.shopY = height * 0.5;
        this.positionShopCards(GameState.getInstance().getShopItems());
        this.embarkButton.setPosition(width * 0.95, height * 0.5);
    }
} 