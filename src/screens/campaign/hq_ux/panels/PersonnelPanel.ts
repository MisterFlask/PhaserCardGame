import { Scene } from 'phaser';
import { PlayerCharacter } from '../../../../gamecharacters/BaseCharacterClass';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { TextBox } from '../../../../ui/TextBox';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class PersonnelPanel extends AbstractHqPanel {
    private characterCards: PhysicalCard[] = [];
    private detailsContainer: Phaser.GameObjects.Container;
    private selectedCharacter: PhysicalCard | null = null;
    private deckDisplayContainer: Phaser.GameObjects.Container;
    private deckScrollPosition: number = 0;
    private readonly SCROLL_SPEED: number = 4;

    constructor(scene: Scene) {
        super(scene, 'Personnel Management');

        // Create containers for details and deck display
        this.detailsContainer = this.scene.add.container(0, 0);
        this.deckDisplayContainer = this.scene.add.container(0, this.scene.scale.height * 0.7);
        
        this.add([this.detailsContainer, this.deckDisplayContainer]);

        // Add scroll wheel listener for deck display
        this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number) => {
            if (this.selectedCharacter) {
                this.handleMouseWheel(deltaY);
            }
        });

        this.displayRoster();
    }

    private displayRoster(): void {
        // Clear existing character cards
        this.characterCards.forEach(card => card.obliterate());
        this.characterCards = [];

        const campaignState = CampaignUiState.getInstance();
        const roster = campaignState.roster;

        // Create grid layout
        const cardsPerRow = 4;
        const cardSpacing = 20;
        const startY = 100;

        roster.forEach((character, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;
            const x = this.scene.scale.width * (0.2 + col * 0.2);
            const y = startY + row * (cardSpacing + 150);

            const card = this.createCharacterCard(character, x, y);
            this.characterCards.push(card);
        });
    }

    private createCharacterCard(character: PlayerCharacter, x: number, y: number): PhysicalCard {
        const card = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x,
            y,
            data: character,
            onCardCreatedEventCallback: (card) => this.setupCharacterCardEvents(card)
        });

        // Add status indicators
        this.addStatusIndicators(card, character);
        this.add(card.container);
        return card;
    }

    private addStatusIndicators(card: PhysicalCard, character: PlayerCharacter): void {
        const statusText = new TextBox({
            scene: this.scene,
            x: 0,
            y: -card.container.height / 2 - 20,
            width: 100,
            height: 30,
            text: this.getCharacterStatus(character),
            style: {
                fontSize: '14px',
                color: this.getStatusColor(character),
                fontFamily: 'Arial'
            }
        });

        card.container.add(statusText);
    }

    private getCharacterStatus(character: PlayerCharacter): string {
        if (character.isDead()) return 'Dead';
        if (character.stress > 50) return 'Shaken';
        return 'Available';
    }

    private getStatusColor(character: PlayerCharacter): string {
        if (character.isDead()) return '#ff0000';
        if (character.stress > 50) return '#ffff00';
        return '#00ff00';
    }

    private setupCharacterCardEvents(card: PhysicalCard): void {
        card.container.setInteractive()
            .on('pointerover', () => {
                card.setGlow(true);
                this.showCharacterDetails(card);
            })
            .on('pointerout', () => {
                if (this.selectedCharacter !== card) {
                    card.setGlow(false);
                }
            })
            .on('pointerdown', () => {
                this.selectCharacter(card);
            });
    }

    private selectCharacter(card: PhysicalCard): void {
        // Unhighlight previously selected character
        if (this.selectedCharacter && this.selectedCharacter !== card) {
            this.selectedCharacter.setGlow(false);
        }

        this.selectedCharacter = card;
        card.setGlow(true);
        this.showCharacterDetails(card);
        this.displayCharacterDeck(card);
    }

    private showCharacterDetails(card: PhysicalCard): void {
        this.detailsContainer.removeAll();
        const character = card.data as PlayerCharacter;

        const details = [
            `Class: ${character.characterClass?.name || 'Unknown'}`,
            `HP: ${character.hitpoints}/${character.maxHitpoints}`,
            `Stress: ${character.stress}`,
            `Quirks: ${character.buffs.map(buff => buff.getDisplayName()).join(', ') || 'None'}`
        ];

        details.forEach((detail, index) => {
            const detailText = new TextBox({
                scene: this.scene,
                x: this.scene.scale.width * 0.75,
                y: this.scene.scale.height * (0.3 + index * 0.05),
                width: 300,
                height: 30,
                text: detail,
                style: { fontSize: '16px', color: '#ffffff' }
            });
            this.detailsContainer.add(detailText);
        });
    }

    private displayCharacterDeck(card: PhysicalCard): void {
        this.deckDisplayContainer.removeAll();
        const character = card.data as PlayerCharacter;
        
        // Display deck cards in a scrollable horizontal line
        const cardSpacing = 20;
        character.cardsInMasterDeck.forEach((deckCard, index) => {
            const physicalCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: index * (100 + cardSpacing),
                y: 0,
                data: deckCard,
                onCardCreatedEventCallback: () => {}
            });
            this.deckDisplayContainer.add(physicalCard.container);
        });

        this.deckScrollPosition = 0;
        this.updateDeckPosition();
    }

    private handleMouseWheel(deltaY: number): void {
        this.deckScrollPosition += deltaY * this.SCROLL_SPEED;
        this.updateDeckPosition();
    }

    private updateDeckPosition(): void {
        this.deckDisplayContainer.setX(-this.deckScrollPosition);
    }

    update(): void {
        // Update any dynamic content
        if (this.selectedCharacter) {
            this.showCharacterDetails(this.selectedCharacter);
        }
    }
} 