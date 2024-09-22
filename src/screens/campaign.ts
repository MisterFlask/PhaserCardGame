import Phaser from 'phaser';
import { BaconBeast, BloodManipulationSlime, ClockworkAbomination } from '../encounters/Encounters';
import { AbstractCard } from '../gamecharacters/AbstractCard';
import { PlayerCharacter } from '../gamecharacters/CharacterClasses';
import { CardType } from '../gamecharacters/Primitives';
import { CampaignRules } from '../rules/CampaignRules';
import { GameState } from '../rules/GameState';
import InventoryPanel from '../ui/InventoryPanel';
import { PhysicalCard, } from '../ui/PhysicalCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import GameImageLoader from '../utils/ImageUtils';

export class StoreCard extends AbstractCard {
    price: number;

    constructor({ name, description, portraitName, tooltip, price }: { name: string; description: string; portraitName?: string, tooltip?: string, price: number}) {
        super(
            {
                name: name,
                description: description,
                portraitName: portraitName,
                cardType: CardType.STORE,
                tooltip: tooltip
            }
        );
        this.price = price;
        this.name = name;
    }
    
    OnPurchase = (): void => {
        console.log('Item purchased');
    }
}

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
    private embarkButton!: Phaser.GameObjects.Text;
    private debugGraphics!: Phaser.GameObjects.Graphics;
    private menuButton!: Phaser.GameObjects.Text;
    private menuPanel!: Phaser.GameObjects.Container;
    private inventoryPanel!: InventoryPanel;

    constructor() {
        super('Campaign');
    }

    create = () => {
        this.createLayout();
        this.createCardSlots();
        this.createCharacterRoster();
        this.createEmbarkButton();
        this.createDeckDisplay();
        this.createShop();
        this.createMenu();
        this.inventoryPanel = new InventoryPanel(this);

        // Listen for resize events
        this.scale.on('resize', this.resize, this);
        this.createDebugGraphics();
        this.updateDebugGraphics();
        this.resize();
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
        this.embarkButton.setPosition(width * 0.95, height * 0.5);

        // Update deck display
        this.updateDeckDisplay(this.deckDisplayCards.map(card => card.data as AbstractCard));

        // Update shop cards
        this.positionShopCards(this.shopCards.map(card => card.data as StoreCard));

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
                eventCallback: () => {}
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
        this.embarkButton = this.add.text(this.scale.width * 0.95, this.scale.height * 0.5, 'Embark!', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setAngle(-90)
        .setInteractive()
        .on('pointerdown', this.onEmbarkClicked, this);
    }

    onEmbarkClicked = () => {
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
                if (card.data instanceof StoreCard) {
                    gameState.addToInventory(card.data);
                }
            });

            // Remove purchased items from shop
            gameState.setShopItems(gameState.getShopItems().filter(item => !selectedShopCards.some(card => card.data === item)));

            console.log('Updated GameState:', gameState);
            // Transition to the next scene or start the game

            GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
            // Switch to the "map" scene
            this.scene.start('MapScene');
        } else {
            console.log('Please select 3 characters before embarking:', selectedCards.map(card => card.data.name));
        }
    }

    createDeckDisplay = () => {
        // Initially create an empty deck display
        this.updateDeckDisplay([]);
    }

    updateDeckDisplay = (cards: AbstractCard[]) => {
        // Clear existing deck display
        // Remove all event handlers from deckDisplayCards
        this.deckDisplayCards.forEach(card => {
            card.container.removeAllListeners();
        });
        this.deckDisplayCards.forEach(card => card.destroy());
        this.deckDisplayCards = [];

        // Remove existing deck slots
        this.cardSlots = this.cardSlots.filter(slot => slot.type !== 'deck');

        // Create new deck display
        const { width } = this.scale;
        const cardWidth = width * 0.1;
        const cardSpacing = width * 0.01;
        const startX = (width - (cards.length * (cardWidth + cardSpacing))) / 2;

        cards.forEach((card, index) => {
            const x = startX + index * (cardWidth + cardSpacing);
            const physicalCard = CardGuiUtils.getInstance().createCard({
                scene: this,
                x: x,
                y: this.deckDisplayY,
                data: card,
                eventCallback: this.setupCardEvents
            });
            this.deckDisplayCards.push(physicalCard);
            
            // Create a new slot for this deck card
            this.createSlot(x, this.deckDisplayY, 'deck');
            const slot = this.cardSlots[this.cardSlots.length - 1];
            this.addCardToSlot(physicalCard, slot);
        });
    }

    setupCardHover = (card: PhysicalCard) => {
        // Remove existing listeners set up by this function
        const pointerOverCallback = () => {
            if (card.data instanceof PlayerCharacter) {
                this.updateDeckDisplay(card.data.cardsInMasterDeck);
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
            new StoreCard({ name: 'Cargo', description: 'Increases carrying capacity', portraitName: '', tooltip: 'Carry more items', price: 100 }),
            new StoreCard({ name: 'Medkit', description: 'Restores health', portraitName: '', tooltip: 'Heal your character', price: 50 }),
            new StoreCard({ name: 'Ammo Pack', description: 'Replenishes ammunition', portraitName: '', tooltip: 'Refill your ammo', price: 75 })
        ];

        this.positionShopCards(shopItems);
    }

    positionShopCards = (shopItems: StoreCard[]) => {
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
                eventCallback: (card) => this.setupShopCardEvents(card)
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
}