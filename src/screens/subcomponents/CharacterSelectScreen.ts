import { PlayerCharacter } from '../../gamecharacters/CharacterClasses';
import { CampaignRules } from '../../rules/CampaignRules';
import { GameState } from '../../rules/GameState';
import { TextBoxButton } from '../../ui/Button';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { CardGuiUtils } from '../../utils/CardGuiUtils';
import CampaignScene from '../campaign/Campaign';

interface CardSlot {
    container: Phaser.GameObjects.Container;
    card: PhysicalCard | null;
    type: 'roster' | 'selected';
}

export class CharacterSelectScreen {
    private scene: CampaignScene;
    private cardSlots: CardSlot[] = [];
    private selectInventoryButton!: TextBoxButton;
    private rosterY: number;
    private selectedY: number;

    constructor(scene: CampaignScene) {
        this.scene = scene;
        this.rosterY = scene.scale.height * 0.3;
        this.selectedY = scene.scale.height * 0.7;
        this.createLayout();
    }

    createLayout() {
        this.createCardSlots();
        this.createCharacterRoster();
        this.createSelectInventoryButton();
    }

    private createCardSlots() {
        const { width } = this.scene.scale;

        // Create roster slots
        for (let i = 0; i < 5; i++) {
            this.createSlot(width * (0.1 + i * 0.18), this.rosterY, 'roster');
        }

        // Create selected character slots
        for (let i = 0; i < 3; i++) {
            this.createSlot(width * (0.25 + i * 0.25), this.selectedY, 'selected');
        }
    }

    private createSlot(x: number, y: number, type: 'roster' | 'selected') {
        const container = this.scene.add.container(x, y);
        const background = this.scene.add.image(0, 0, 'card_background').setOrigin(0.5);
        container.add(background);

        const slot: CardSlot = { container, card: null, type };
        this.cardSlots.push(slot);
    }

    private createCharacterRoster() {
        const characters = CampaignRules.getInstance().generateLogicalCharacterRoster();
        const rosterSlots = this.cardSlots.filter(slot => slot.type === 'roster');

        characters.forEach((character, index) => {
            const card = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: 0,
                y: 0,
                data: character,
                onCardCreatedEventCallback: () => {}
            });
            this.addCardToSlot(card, rosterSlots[index]);
            this.setupCardEvents(card);
        });
    }

    private createSelectInventoryButton() {
        this.selectInventoryButton = new TextBoxButton({
            scene: this.scene,
            x: this.scene.scale.width * 0.95,
            y: this.scene.scale.height * 0.5,
            width: 200,
            height: 40,
            text: 'Select Inventory',
            style: {
                fontSize: '24px',
                color: '#ffffff',
            },
            fillColor: 0x4a4a4a,
        })
        .setOrigin(0.5)
        .onClick(this.onSelectInventoryClicked.bind(this));

        this.scene.add.existing(this.selectInventoryButton);
    }

    private onSelectInventoryClicked() {
        const selectedCards = this.getSelectedCards();
        if (selectedCards.length === 3) {
            // Update GameState with selected characters
            const gameState = GameState.getInstance();
            gameState.currentRunCharacters = [];
            selectedCards.forEach(card => {
                if (card.data instanceof PlayerCharacter) {
                    gameState.addToCurrentRun(card.data);
                }
            });
            
            // Switch to inventory screen
            this.scene.switchToInventoryScreen();
        } else {
            console.log('Please select 3 characters before continuing');
        }
    }

    // ... (include other necessary methods from the original CampaignScene)
    // Include the card event handling methods, slot management, etc.

    hide() {
        this.cardSlots.forEach(slot => slot.container.setVisible(false));
        this.selectInventoryButton.setVisible(false);
    }

    show() {
        this.cardSlots.forEach(slot => slot.container.setVisible(true));
        this.selectInventoryButton.setVisible(true);
    }

    resize() {
        const { width, height } = this.scene.scale;
        this.rosterY = height * 0.3;
        this.selectedY = height * 0.7;

        // Update positions of all elements
        this.cardSlots.forEach((slot, index) => {
            if (slot.type === 'roster') {
                slot.container.setPosition(width * (0.1 + index * 0.18), this.rosterY);
            } else if (slot.type === 'selected') {
                slot.container.setPosition(width * (0.25 + index * 0.25), this.selectedY);
            }
        });

        this.selectInventoryButton.setPosition(width * 0.95, height * 0.5);
    }
} 