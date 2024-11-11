import Phaser from 'phaser';
import { BaconBeast, BloodManipulationSlime, ClockworkAbomination, EncounterManager } from '../../encounters/Encounters';
import { AbstractCard } from '../../gamecharacters/AbstractCard';
import { PlayerCharacter } from '../../gamecharacters/CharacterClasses';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { AlcoholCargo } from '../../gamecharacters/playerclasses/cards/cargo/AlcoholCargo';
import { CoffeeCargo } from '../../gamecharacters/playerclasses/cards/cargo/CoffeeCargo';
import { SacredRelicsCargo } from '../../gamecharacters/playerclasses/cards/cargo/SacredRelicsCargo';
import { SpicyLiteratureCargo } from '../../gamecharacters/playerclasses/cards/cargo/SpicyLiteratureCargo';
import { CampaignRules } from '../../rules/CampaignRules';
import { GameState } from '../../rules/GameState';
import { TextBoxButton } from '../../ui/Button';
import InventoryPanel from '../../ui/InventoryPanel';
import { PhysicalCard, } from '../../ui/PhysicalCard';
import { ActionManagerFetcher } from '../../utils/ActionManagerFetcher';
import { CardGuiUtils } from '../../utils/CardGuiUtils';
import GameImageLoader from '../../utils/ImageUtils';
import { SceneChanger } from '../SceneChanger';
import { CharacterSelectScreen } from './CharacterSelectScreen';
import { InventoryScreen } from './InventoryScreen';

interface CardSlot {
    container: Phaser.GameObjects.Container;
    card: PhysicalCard | null;
    type: 'roster' | 'selected' | 'deck' | 'shop';
}

export default class CampaignScene extends Phaser.Scene {
    private cardSlots: CardSlot[] = [];
    private deckDisplayCards: PhysicalCard[] = [];
    private shopCards: PhysicalCard[] = [];
    private deckDisplayY: number = 0;
    private shopY: number = 0;
    private rosterY: number = 0;
    private selectedY: number = 0;
    private embarkButton!: TextBoxButton;
    private debugGraphics!: Phaser.GameObjects.Graphics;
    private menuButton!: Phaser.GameObjects.Text;
    private menuPanel!: Phaser.GameObjects.Container;
    private inventoryPanel!: InventoryPanel;
    private deckDisplayContainer!: Phaser.GameObjects.Container;
    private deckScrollPosition: number = 0;
    private readonly SCROLL_SPEED: number = 4;
    private characterSelectScreen!: CharacterSelectScreen;
    private inventoryScreen!: InventoryScreen;
    private currentScreen: 'character' | 'inventory' = 'character';

    constructor() {
        super('Campaign');
    }

    init = () => {
        SceneChanger.setCurrentScene(this);
    }

    create =  () => {
        ActionManagerFetcher.initActionManager();
        
        this.characterSelectScreen = new CharacterSelectScreen(this);
        this.inventoryScreen = new InventoryScreen(this);
        
        // Start with character select screen
        this.showCharacterSelect();
    }

    createMenu() {
        this.menuButton = this.add.text(10, 10, 'MENU', { fontSize: '24px', color: '#fff' })
          .setInteractive()
          .on('pointerdown', this.toggleMenu, this);
   
        this.menuPanel = this.add.container(400, 300).setVisible(false);
        const panelBg = this.add.rectangle(0, 0, 200, 100, 0x000000, 0.8);
        const closeButton = this.add.text(-80, -30, 'CLOSE MENU', { fontSize: '16px', color: '#fff' })
          .setInteractive()
          .on('pointerdown', this.toggleMenu, this);
        const debugButton = this.add.text(-80, 10, 'COMBAT SCENE DEBUG', { fontSize: '16px', color: '#fff' })
          .setInteractive()
          .on('pointerdown', this.startCombatDebug, this);
   
        this.menuPanel.add([panelBg, closeButton, debugButton]);
      }
   
      toggleMenu() {
        this.menuPanel.setVisible(!this.menuPanel.visible);
        if (this.menuPanel.visible) {
            this.menuPanel.setDepth(Number.MAX_SAFE_INTEGER);
        }
      }
   
      startCombatDebug() {
        const gameState = GameState.getInstance();
        const campaignRules = CampaignRules.getInstance();
        
        // Generate logical character roster
        const characterRoster = campaignRules.generateLogicalCharacterRoster();
        
        gameState.currentRunCharacters = characterRoster.slice(0, 3);
        gameState.roster = characterRoster;

        GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
        this.scene.start('CombatScene', { 
          encounter: { 
            enemies: [new ClockworkAbomination(), new BaconBeast(), new BloodManipulationSlime()] 
          } 
        });
    }
    
    preload = (): void => {
        this.load.setBaseURL('https://raw.githubusercontent.com/');
        new GameImageLoader().loadAllImages(this.load);
    }

    createLayout = () => {
        const { width, height } = this.scale;
        this.rosterY = height * 0.1;
        this.deckDisplayY = height * 0.3;
        this.shopY = height * 0.5;
        this.selectedY = height * 0.85;
    }


    createCardSlots = () => {
        const { width } = this.scale;

        // Create roster slots
        for (let i = 0; i < 5; i++) {
            this.createSlot(width * (0.1 + i * 0.18), this.rosterY, 'roster');
        }

        // Create selected character slots
        for (let i = 0; i < 3; i++) {
            this.createSlot(width * (0.25 + i * 0.25), this.selectedY, 'selected');
        }
    }

    createSlot = (x: number, y: number, type: 'roster' | 'selected' | 'deck' | 'shop') => {
        const container = this.add.container(x, y);
        const background = this.add.image(0, 0, 'card_background').setOrigin(0.5);
        container.add(background);

        const slot: CardSlot = { container, card: null, type };
        this.cardSlots.push(slot);
    }

    createCharacterRoster = () => {
        const characters = CampaignRules.getInstance().generateLogicalCharacterRoster();
        const rosterSlots = this.cardSlots.filter(slot => slot.type === 'roster');

        characters.forEach((character, index) => {
            const card = CardGuiUtils.getInstance().createCard({
                scene: this,
                x: 0,
                y: 0,
                data: character,
                onCardCreatedEventCallback: () => {}
            });
            this.addCardToSlot(card, rosterSlots[index]);
            this.setupCardHover(card);
        });
    }

    addCardToSlot = (card: PhysicalCard, slot: CardSlot) => {
        slot.card = card;
        slot.container.add(card.container);
        card.container.setPosition(0, 0);
        //this.setupCardEvents(card);
    }

    private onPointerDown = (pointer: Phaser.Input.Pointer, card: PhysicalCard) => {
        const lastClickTime = card.container.getData('lastClickTime') || 0;
        const currentTime = pointer.downTime;
        
        if (currentTime - lastClickTime < 300) {
            this.onDoubleClick(card);
        }
        
        card.container.setData('lastClickTime', currentTime);
    }
    bringToFront = (card: PhysicalCard) => {
        console.log('Bringing to front:', card.data.name);
        const slot = this.findSlotWithCard(card);
        if (slot) {
            slot.container.setDepth(100);
        }
    }
    
    sendToBack = (card: PhysicalCard) => {
        console.log('Sending to back:', card.data.name);
        const slot = this.findSlotWithCard(card);
        if (slot) {
            slot.container.setDepth(1);
        }
    }

    onDoubleClick = (card: PhysicalCard) => {
        const sourceSlot = this.findSlotWithCard(card);
        if (!sourceSlot) return;
    
        let targetSlot: CardSlot | undefined;
    
        if (sourceSlot.type === 'roster') {
            targetSlot = this.cardSlots.find(slot => slot.type === 'selected' && !slot.card);
        } else if (sourceSlot.type === 'selected') {
            targetSlot = this.cardSlots.find(slot => slot.type === 'roster' && !slot.card);
            
            // If we're unselecting a character, return their purchased cards to the shop
            if (card.data instanceof PlayerCharacter) {
                const gameState = GameState.getInstance();
                const purchasedCards = card.data.cardsInMasterDeck.filter(deckCard => 
                    // Only return cards that were available in the shop (cargo cards)
                    deckCard instanceof PlayableCard && 
                    deckCard.name.includes('Cargo')
                );
                
                // Remove the cards from the character's deck
                card.data.cardsInMasterDeck = card.data.cardsInMasterDeck.filter(deckCard => 
                    !purchasedCards.includes(deckCard)
                );
                
                // Add the cards back to the shop
                const currentShopItems = gameState.getShopItems();
                gameState.setShopItems([...currentShopItems, ...purchasedCards]);
                
                // Update the shop display
                this.positionShopCards(gameState.getShopItems());
            }
        }
    
        if (targetSlot && this.canMoveCardToSlot(sourceSlot, targetSlot)) {
            this.moveCardToSlot(card, sourceSlot, targetSlot);
            // Prevent further processing of this double-click
            card.container.setData('lastClickTime', 0);
        }
    }
    
    findSlotWithCard = (card: PhysicalCard): CardSlot | undefined => {
        if (!card) return undefined;
        return this.cardSlots.find(slot => slot.card === card);
    }

    canMoveCardToSlot = (sourceSlot: CardSlot | undefined, targetSlot: CardSlot): boolean => {
        if (!sourceSlot || !targetSlot) return false;
        if (sourceSlot === targetSlot) return false;
        if (targetSlot.type === 'selected' && this.getSelectedCards().length >= 3) return false;
        return (targetSlot.type === 'roster' || targetSlot.type === 'selected');
    }

    moveCardToSlot = (card: PhysicalCard, sourceSlot: CardSlot | undefined, targetSlot: CardSlot) => {
        if (sourceSlot) sourceSlot.card = null;
        this.addCardToSlot(card, targetSlot);
    }

    getSelectedCards = (): PhysicalCard[] => {
        return this.cardSlots
            .filter(slot => slot.type === 'selected' && slot.card)
            .map(slot => slot.card!);
    }

    createEmbarkButton = () => {
        this.embarkButton = new TextBoxButton({
            scene: this,
            x: this.scale.width * 0.95,
            y: this.scale.height * 0.5,
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
        .onClick(this.onEmbarkClicked);

        this.add.existing(this.embarkButton);
    }

    onEmbarkClicked = () => {
        console.log('Embark button clicked');
        const selectedCards = this.getSelectedCards();
        const selectedShopCards = this.shopCards.filter(card => card.container.getData('isSelected'));
        if (selectedCards.length === 3) {
            console.log('Embarking on adventure with:', selectedCards.map(card => card.data.name));
            console.log('Purchased items:', selectedShopCards.map(card => card.data.name));
            // Update the GameState with selected characters and purchased items
            const gameState = GameState.getInstance();
            
            // Clear current run characters and add selected characters
            gameState.currentRunCharacters = [];
            selectedCards.forEach(card => {
                if (card.data instanceof PlayerCharacter) {
                    gameState.addToCurrentRun(card.data);
                }
            });

            // Add purchased items to inventory
            selectedShopCards.forEach(card => {
                if (card.data instanceof PlayableCard) {
                    gameState.addToInventory(card.data);
                }
            });

            // Remove purchased items from shop
            gameState.setShopItems(gameState.getShopItems().filter(item => !selectedShopCards.some(card => card.data === item)));

            console.log('Updated GameState:', gameState);
            // Transition to the next scene or start the game

            GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
            // Switch to the "map" scene
            console.log('switching to combat scene:', gameState);

            SceneChanger.switchToCombatScene({ encounter: EncounterManager.getInstance().getShopEncounter().data });
        } else {
            console.log('Please select 3 characters before embarking:', selectedCards.map(card => card.data.name));
        }
    }

    createDeckDisplay = () => {
        // Initially create an empty deck display
        this.updateDeckDisplay([]);
    }

    createDeckDisplayContainer() {
        if (!this.deckDisplayContainer) {
            this.deckDisplayContainer = this.add.container(0, this.deckDisplayY);
            this.add.existing(this.deckDisplayContainer);
        }
    }

    handleMouseWheel = (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) => {
        // Scroll left or right based on wheel movement
        console.log('Mouse wheel event detected:', { deltaX, deltaY, deltaZ });
        this.deckScrollPosition += deltaY * this.SCROLL_SPEED;
        this.updateDeckDisplayPosition();
    }

    updateDeckDisplayPosition() {
        this.deckDisplayContainer.setX(-this.deckScrollPosition);
    }

    updateDeckDisplay = (cards: AbstractCard[]) => {
        // Ensure the container exists
        this.createDeckDisplayContainer();

        this.deckDisplayContainer.removeAll();
        // Clear existing deck display
        this.deckDisplayCards.forEach(card => {
            card.container.removeAllListeners();
            card.destroy();
        });
        this.deckDisplayCards = [];

        // Create new deck display
        const { width } = this.scale;
        const cardWidth = width * 0.1;
        const cardSpacing = width * 0.01;

        cards.forEach((card, index) => {
            const x = index * (cardWidth + cardSpacing);
            const physicalCard = CardGuiUtils.getInstance().createCard({
                scene: this,
                x: x,
                y: 0,
                data: card,
                //onCardCreatedEventCallback: this.setupCardEvents TODO
            });
            this.deckDisplayCards.push(physicalCard);
            this.deckDisplayContainer.add(physicalCard.container);
        });

        // Reset scroll position
        this.deckScrollPosition = 0;
        this.updateDeckDisplayPosition();
    }

    setupCardHover = (card: PhysicalCard) => {
        const pointerOverCallback = () => {
            if (card.data instanceof PlayerCharacter) {
                this.updateDeckDisplay(card.data.cardsInMasterDeck);
                // Reset scroll position when mousing over a new character
                this.deckScrollPosition = 0;
                this.updateDeckDisplayPosition();
            }
            this.bringToFront(card);
        };
        const pointerOutCallback = () => {
            this.sendToBack(card);
        };

        card.container.off('pointerover', pointerOverCallback, this)
            .off('pointerout', pointerOutCallback, this);

        card.container.setInteractive()
            .on('pointerover', pointerOverCallback, this)
            .on('pointerout', pointerOutCallback, this);
    }

    createDebugGraphics = () => {
        this.debugGraphics = this.add.graphics();
    }

    updateDebugGraphics = () => {
        this.debugGraphics.clear();
        this.debugGraphics.lineStyle(2, 0xff0000);
        
        this.cardSlots.forEach(slot => {
            this.debugGraphics.strokeRect(
                slot.container.x - 50, 
                slot.container.y - 70, 
                100, 
                140
            );
        });
    }

    createShop = () => {
        // Get shop items from GameState instead of creating new ones directly
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

    positionShopCards = (shopItems: PlayableCard[]) => {
        // Clear existing shop cards and slots
        // Remove all existing shop card event handlers
        this.shopCards.forEach(card => {
            card.container.removeAllListeners();
        });
        this.shopCards.forEach(card => card.destroy());
        this.shopCards = [];
        this.cardSlots = this.cardSlots.filter(slot => slot.type !== 'shop');

        const { width } = this.scale;
        const cardWidth = width * 0.1;
        const cardSpacing = width * 0.01;
        const startX = (width - (shopItems.length * (cardWidth + cardSpacing))) / 2;
        shopItems.forEach((item, index) => {
            const x = startX + index * (cardWidth + cardSpacing);
            const physicalCard = CardGuiUtils.getInstance().createCard({
                scene: this,
                x: x,
                y: this.shopY,
                data: item,
                onCardCreatedEventCallback: (card) => this.setupShopCardEvents(card)
            });
            this.shopCards.push(physicalCard);
            // Create a new slot for this shop card
            this.createSlot(x, this.shopY, 'shop');
            const slot = this.cardSlots[this.cardSlots.length - 1];
            this.addCardToSlot(physicalCard, slot);
        });
    }
    
    setupShopCardEvents = (card: PhysicalCard): void => {
        card.container.removeAllListeners();
        
        // Track original position for returning the card if needed
        const originalX = card.container.x;
        const originalY = card.container.y;
        
        card.container.setInteractive({ draggable: true })
            .on('dragstart', () => {
                card.container.setScale(1.1);
                this.children.bringToTop(card.container);
            })
            .on('drag', (pointer: Phaser.Input.Pointer) => {
                // Convert pointer position to local coordinates
                const localPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                card.container.x = localPoint.x;
                card.container.y = localPoint.y;
            })
            .on('dragend', (pointer: Phaser.Input.Pointer) => {
                card.container.setScale(1);
                this.handleShopCardDrop(card, pointer);
            });
    }

    handleShopCardDrop = (card: PhysicalCard, pointer: Phaser.Input.Pointer) => {
        const selectedSlots = this.cardSlots.filter((slot: CardSlot) => 
            slot.type === 'selected' && slot.card !== null
        );
        
        let targetSlot: CardSlot | null = null;
        
        for (const slot of selectedSlots) {
            if (!slot.card) continue;
            
            // Get the bounds of the character card in world coordinates
            const characterBounds = slot.card.container.getBounds();
            
            // Use pointer position directly
            if (Phaser.Geom.Rectangle.Contains(
                characterBounds,
                pointer.x,
                pointer.y
            )) {
                targetSlot = slot;
                break;
            }
        }

        if (targetSlot && targetSlot.card) {
            const targetCharacter = targetSlot.card.data;
            if (targetCharacter instanceof PlayerCharacter && card.data instanceof PlayableCard) {
                targetCharacter.cardsInMasterDeck.push(card.data);
                
                const gameState = GameState.getInstance();
                const updatedShopItems = gameState.getShopItems().filter(item => item !== card.data);
                gameState.setShopItems(updatedShopItems);
                
                this.positionShopCards(updatedShopItems);
                this.showPurchaseEffect(pointer.x, pointer.y);
            }
        } else {
            // If not dropped on a character card, return to original position
            this.positionShopCards(GameState.getInstance().getShopItems());
        }
    }

    showPurchaseEffect = (x: number, y: number) => {
        const particles = this.add.particles(x, y, 'particle', {
            speed: { min: -100, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            quantity: 1,
            frequency: 25,
            duration: 500
        });

        this.time.delayedCall(500, () => {
            particles.destroy();
        });
    }

    pulseEmbarkButton = () => {
        this.embarkButton.pulseGreenBriefly();
    }

    switchToInventoryScreen() {
        this.currentScreen = 'inventory';
        this.characterSelectScreen.hide();
        this.inventoryScreen.show();
    }

    showCharacterSelect() {
        this.currentScreen = 'character';
        this.characterSelectScreen.show();
        this.inventoryScreen.hide();
    }
}