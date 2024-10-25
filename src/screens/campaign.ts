import Phaser from 'phaser';
import { BaconBeast, BloodManipulationSlime, ClockworkAbomination, EncounterManager } from '../encounters/Encounters';
import { AbstractCard } from '../gamecharacters/AbstractCard';
import { PlayerCharacter } from '../gamecharacters/CharacterClasses';
import { PlayableCard } from '../gamecharacters/PlayableCard';
import { CardType } from '../gamecharacters/Primitives';
import { CampaignRules } from '../rules/CampaignRules';
import { GameState } from '../rules/GameState';
import { TextBoxButton } from '../ui/Button';
import InventoryPanel from '../ui/InventoryPanel';
import { PhysicalCard, } from '../ui/PhysicalCard';
import { ActionManagerFetcher } from '../utils/ActionManagerFetcher';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import GameImageLoader from '../utils/ImageUtils';
import { SceneChanger } from './SceneChanger';

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

    constructor() {
        super('Campaign');
    }

    init = () => {
        SceneChanger.setCurrentScene(this);
    }

    create =  () => {
        ActionManagerFetcher.initActionManager();
        this.createLayout();
        this.createDeckDisplayContainer(); // Add this line here
        this.createCardSlots();
        this.createCharacterRoster();
        this.createEmbarkButton();
        this.createDeckDisplay();
        this.createShop();
        this.createMenu();
        this.inventoryPanel = new InventoryPanel(this);

        this.createDebugGraphics();
        this.updateDebugGraphics();
        this.resize();
        this.input.on('wheel', this.handleMouseWheel, this);
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

    resize = () => {
        console.log('Resizing campaign scene');
        // Bail if we're not in this scene right now
        if (!this.scene.isActive('Campaign')) {
            return;
        }
        const { width, height } = this.scale;

        // Update layout
        this.rosterY = height * 0.1;
        this.deckDisplayY = height * 0.3;
        this.shopY = height * 0.5;
        this.selectedY = height * 0.85;

        // Reposition card slots
        this.cardSlots.forEach((slot, index) => {
            if (slot.type === 'roster') {
                slot.container.setPosition(width * (0.1 + index * 0.18), this.rosterY);
            } else if (slot.type === 'selected') {
                slot.container.setPosition(width * (0.1 + index * 0.1), this.selectedY);
            } else if (slot.type === 'deck') {
                const cardWidth = width * 0.1;
                const cardSpacing = width * 0.01;
                const startX = (width - (this.deckDisplayCards.length * (cardWidth + cardSpacing))) / 2;
                slot.container.setPosition(startX + index * (cardWidth + cardSpacing), this.deckDisplayY);
            } else if (slot.type === 'shop') {
                const cardWidth = width * 0.1;
                const cardSpacing = width * 0.01;
                const startX = (width - (this.shopCards.length * (cardWidth + cardSpacing))) / 2;
                slot.container.setPosition(startX + index * (cardWidth + cardSpacing), this.shopY);
            }

            console.log(`Slot ${index} (${slot.type}): x=${slot.container.x}, y=${slot.container.y}`);
        });

        // Reposition embark button
        if (this.embarkButton) {
            this.embarkButton.setPosition(width * 0.95, height * 0.5);
        }

        // Update deck display
        this.updateDeckDisplay(this.deckDisplayCards.map(card => card.data as AbstractCard));

        // Update shop cards
        this.positionShopCards(this.shopCards.map(card => card.data as PlayableCard));

        // Reposition menu button
        this.menuButton.setPosition(10, 10);

        // Reposition inventory button
        this.inventoryPanel.resize(width, height);

        this.updateDebugGraphics();
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
        this.setupCardEvents(card);
    }

    setupCardEvents = (card: PhysicalCard): void => {
        // Remove existing listeners set up by this function
        const pointerDownCallback = (pointer: Phaser.Input.Pointer) => {
            this.onPointerDown(pointer, card);
        };
        const pointerOverCallback = () => {
            this.bringToFront(card);
        };
        const pointerOutCallback = () => {
            this.sendToBack(card);
        };

        card.container.off('pointerdown', pointerDownCallback, this)
            .off('pointerover', pointerOverCallback, this)
            .off('pointerout', pointerOutCallback, this);
    
        card.container.setInteractive()
            .on('pointerdown', pointerDownCallback, this)
            .on('pointerover', pointerOverCallback, this)
            .on('pointerout', pointerOutCallback, this);
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
                onCardCreatedEventCallback: this.setupCardEvents
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
        const shopItems = [
            new CargoCard(),
            new MedkitCard(),
            new AmmoPackCard()
        ];

        this.positionShopCards(shopItems);
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
        console.log('Setting up shop card events'); // Add this line for debugging
        card.container.setInteractive()
            .on('pointerover', () => {
                card.container.setScale(1.1);
            })
            .on('pointerout', () => {
                card.container.setScale(1);
            })
            .on('pointerdown', () => {
                console.log('Shop card clicked'); // Add this line for debugging

                this.toggleCardSelection(card);
            });
    }

    toggleCardSelection = (card: PhysicalCard): void => {
        const isAlreadySelected = card.container.getData('isSelected');
        card.container.setData('isSelected', !isAlreadySelected);
        
        console.log('Toggling selection:', !isAlreadySelected); // Add this line for debugging
        
        if (!isAlreadySelected) {
            // Create a selection border if it doesn't exist
            if (!card.container.getData('selectionBorder')) {
                const border = this.add.graphics();
                border.lineStyle(4, 0xffff00); // Increase line width for visibility
                border.strokeRect(-50, -70, 100, 140); // Use fixed dimensions
                card.container.add(border);
                card.container.setData('selectionBorder', border);
            } else {
                // Show existing border
                card.container.getData('selectionBorder').setVisible(true);
            }
        } else {
            // Hide the selection border
            const border = card.container.getData('selectionBorder');
            if (border) {
                border.setVisible(false);
            }
        }
    }

    pulseEmbarkButton = () => {
        this.embarkButton.pulseGreenBriefly();
    }
}
class CargoCard extends PlayableCard {
    constructor() {
        super({ 
            name: 'Cargo', 
            description: 'Increases carrying capacity', 
            portraitName: '', 
            tooltip: 'Carry more items', 
            price: 100, 
            cardType: CardType.POWER 
        });
    }

    OnPurchase = (): void => {
        console.log('Cargo item purchased');
        // Additional logic for CargoCard purchase
    }
    InvokeCardEffects(targetCard?: AbstractCard): void {
    }
}

class MedkitCard extends PlayableCard {
    constructor() {
        super({ 
            name: 'Medkit', 
            description: 'Restores health', 
            portraitName: '', 
            tooltip: 'Heal your character', 
            price: 50, 
            cardType: CardType.POWER 
        });
    }

    OnPurchase = (): void => {
        console.log('Medkit item purchased');
        // Additional logic for MedkitCard purchase
    }

    InvokeCardEffects(targetCard?: AbstractCard): void {
    }
}

class AmmoPackCard extends PlayableCard {
    constructor() {
        super({ 
            name: 'Ammo Pack', 
            description: 'Replenishes ammunition', 
            portraitName: '', 
            tooltip: 'Refill your ammo', 
            price: 75, 
            cardType: CardType.POWER 
        });
    }

    OnPurchase = (): void => {
        console.log('Ammo Pack item purchased');
        // Additional logic for AmmoPackCard purchase
    }
    
    InvokeCardEffects(targetCard?: AbstractCard): void {
    }
}
