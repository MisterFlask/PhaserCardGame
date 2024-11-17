// src/managers/CombatCardManager.ts

import Phaser from 'phaser';
import { AbstractCard, Team, UiCard } from '../../gamecharacters/AbstractCard';
import { AutomatedCharacter } from '../../gamecharacters/AutomatedCharacter';
import { IAbstractCard } from '../../gamecharacters/IAbstractCard';
import { GameState } from '../../rules/GameState';
import { DepthManager } from '../../ui/DepthManager';
import CombatSceneLayoutUtils from '../../ui/LayoutUtils';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { CardGuiUtils } from '../../utils/CardGuiUtils';

export class CombatCardManager {
    private scene: Phaser.Scene;
    public playerHand: PhysicalCard[] = [];
    public enemyUnits: PhysicalCard[] = [];
    public playerUnits: PhysicalCard[] = [];
    public drawPile!: PhysicalCard;
    public discardPile!: PhysicalCard;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createDrawAndDiscardPiles();
        this.createPlayerHand();
        this.createPlayerUnits();
        this.createEnemyCards();
    }

    private createPlayerHand(): void {
        const state = GameState.getInstance().combatState.currentHand;
        state.forEach(cardData => {
            const card = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: 0,
                y: CombatSceneLayoutUtils.getHandY(this.scene),
                data: cardData as AbstractCard,
                onCardCreatedEventCallback: (card: PhysicalCard) => {
                    // Make player hand cards interactive and draggable
                    card.container.setInteractive({
                        hitArea: card.cardBackground,
                        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                        useHandCursor: true
                    });
                    this.scene.input.setDraggable(card.container);
                    card.data.physicalCard = card;
                }
            });
            this.playerHand.push(card);
        });
        this.arrangeCards(this.playerHand, CombatSceneLayoutUtils.getHandY(this.scene));
    }

    public addCardToDiscardPile(card: PhysicalCard): void {
        this.scene.tweens.add({
            targets: card.container,
            x: this.discardPile.container.x,
            y: this.discardPile.container.y,
            scaleX: 0.5,
            scaleY: 0.5,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.discardPile.data.name = `Discard Pile (${GameState.getInstance().combatState.currentDiscardPile.length + 1})`;
                this.discardPile.nameBox.setText(this.discardPile.data.name);
                card.obliterate(); // Remove the card after animation
            }
        });
    }
    
    private createPlayerUnits(): void {
        const playerCharacters = GameState.getInstance().combatState.playerCharacters;
        playerCharacters.forEach((characterData, index) => {
            const x = this.scene.scale.width - 100;
            const y = 100 + index * 180;
            const unit = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: x,
                y: y,
                data: characterData,
                onCardCreatedEventCallback: () => { }
            });
            unit.data.physicalCard = unit;
            unit.data.team = Team.ALLY;
            (unit as any).isPlayerUnit = true;
            this.playerUnits.push(unit);
        });
    }

    private createEnemyCards(): void {
        const enemies = GameState.getInstance().combatState.enemies;
        const cardWidth = 150;
        const depthManager = DepthManager.getInstance();
        
        enemies.forEach((enemy, index) => {
            enemy.team = Team.ENEMY;
            const enemyCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: 400 + index * (cardWidth * 2),
                y: CombatSceneLayoutUtils.getBattlefieldY(this.scene),
                data: enemy,
                onCardCreatedEventCallback: (card: PhysicalCard) => {
                    // Make enemy cards interactive if needed
                    card.container.setInteractive({
                        hitArea: card.cardBackground,
                        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                        useHandCursor: true
                    });
                    // If enemy cards should be draggable
                    this.scene.input.setDraggable(card.container);
                }
            });
            if (enemy instanceof AutomatedCharacter) {
                enemy.setNewIntents();
            }
            enemyCard.container.setDepth(depthManager.CARD_BASE);
            this.enemyUnits.push(enemyCard);
        });
    }

    private createDrawAndDiscardPiles(): void {
        const gameWidth = this.scene.scale.width;
        const pileY = CombatSceneLayoutUtils.getPileY(this.scene);

        this.drawPile = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: gameWidth * 0.1,
            y: pileY,
            data: new UiCard({ name: 'Draw Pile (0)', description: 'Cards to draw', portraitName: "drawpile" }),
            onCardCreatedEventCallback: (card: PhysicalCard) => {
                // Make draw pile interactive
                card.container.setInteractive({
                    hitArea: card.cardBackground,
                    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                    useHandCursor: true
                });
                card.container.on('pointerdown', () => {
                    this.scene.events.emit('drawPileClicked');
                });
            }
        });

        this.discardPile = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: gameWidth * 0.2,
            y: pileY,
            data: new UiCard({ name: 'Discard Pile (0)', description: 'Discarded cards', portraitName: "discardpile" }),
            onCardCreatedEventCallback: (card: PhysicalCard) => {
                // Make discard pile interactive
                card.container.setInteractive({
                    hitArea: card.cardBackground,
                    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                    useHandCursor: true
                });
                card.container.on('pointerdown', () => {
                    this.scene.events.emit('discardPileClicked');
                });
            }
        });
    }

    public arrangeCards(cardArray: PhysicalCard[], yPosition: number): void {
        CombatSceneLayoutUtils.arrangeCards(this.scene, cardArray, yPosition);
    }

    public syncHandWithGameState(): void {
        const state = GameState.getInstance().combatState;
        const existingCards = new Map(this.playerHand.map(card => [card.data.id, card]));

        // Remove cards no longer in hand
        existingCards.forEach((physicalCard, id) => {
            if (!state.currentHand.some(c => c.id === id)) {
                this.discardCardAnimation(physicalCard);
            }
        });

        // Add new cards to hand
        state.currentHand.forEach(abstractCard => {
            if (!existingCards.has(abstractCard.id)) {
                const newCard = this.animateCardDraw(abstractCard as IAbstractCard);
                this.playerHand.push(newCard);
            }
        });

        // Remove discarded cards from hand
        this.playerHand = this.playerHand.filter(card => state.currentHand.some(c => c.id === card.data.id));

        // Arrange the hand
        this.arrangeCards(this.playerHand, CombatSceneLayoutUtils.getHandY(this.scene));
    }

    private animateCardDraw(data: IAbstractCard): PhysicalCard {
        const card = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: this.drawPile.container.x,
            y: this.drawPile.container.y,
            data: data as AbstractCard,
            onCardCreatedEventCallback: (card: PhysicalCard) => {
                // Make drawn cards interactive and draggable
                card.container.setInteractive({
                    hitArea: card.cardBackground,
                    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                    useHandCursor: true
                });
                this.scene.input.setDraggable(card.container);
            }
        });
        data.physicalCard = card;
        card.container.setScale(0.5);
        card.container.setAlpha(0);

        // Animate the card moving to the hand
        this.scene.tweens.add({
            targets: card.container,
            x: card.container.x,
            y: CombatSceneLayoutUtils.getHandY(this.scene),
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });

        return card;
    }

    private discardCardAnimation(card: PhysicalCard): void {
        this.playerHand = this.playerHand.filter(c => c !== card);

        // Create a discard animation
        this.scene.tweens.add({
            targets: card.container,
            x: this.discardPile.container.x,
            y: this.discardPile.container.y,
            scaleX: 0.5,
            scaleY: 0.5,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                card.data.physicalCard = undefined;
                card.obliterate(); // Remove the card after animation
            }
        });
    }

    public updateDrawPileCount(): void {
        if (this.drawPile) {
            const state = GameState.getInstance().combatState;
            const drawPileCount = state.currentDrawPile.length;
            this.drawPile.data.name = `Draw Pile (${drawPileCount})`;
            this.drawPile.nameBox.setText(this.drawPile.data.name);
        }
    }

    public updateDiscardPileCount(): void {
        if (this.discardPile) {
            const state = GameState.getInstance().combatState;
            const discardPileCount = state.currentDiscardPile.length;
            this.discardPile.data.name = `Discard Pile (${discardPileCount})`;
            this.discardPile.nameBox.setText(this.discardPile.data.name);
        }
    }

    public update() {
        // Ensure physical cards match the game state
        const state = GameState.getInstance().combatState;
        state.currentHand.forEach(cardData => {
            if (!cardData.physicalCard) {
                // Find the matching physical card in our hand
                const matchingPhysicalCard = this.playerHand.find(physicalCard => 
                    physicalCard.data === cardData
                );
                
                if (matchingPhysicalCard) {
                    cardData.physicalCard = matchingPhysicalCard;
                }
            }
        });

        // Set scroll factor to 0 for all cards
        [...this.playerHand, ...this.enemyUnits, ...this.playerUnits, this.drawPile, this.discardPile].forEach(card => {
            if (card && card.container) {
                card.container.setScrollFactor(0);
            }
        });

        // Update draw and discard pile names to reflect current counts
        this.updateDrawPileCount();
        this.updateDiscardPileCount();
    }

}

export default CombatCardManager;
