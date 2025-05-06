// src/managers/CombatCardManager.ts

import Phaser from 'phaser';
import { AbstractCard, Team, UiCard } from '../../gamecharacters/AbstractCard';
import { AutomatedCharacter } from '../../gamecharacters/AutomatedCharacter';
import { IAbstractCard } from '../../gamecharacters/IAbstractCard';
import { CardSize } from '../../gamecharacters/Primitives';
import { GameState } from '../../rules/GameState';
import { DepthManager } from '../../ui/DepthManager';
import { EnemyPositionManager } from '../../ui/EnemyPositionManager';
import CombatSceneLayoutUtils from '../../ui/LayoutUtils';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { CardGuiUtils } from '../../utils/CardGuiUtils';

export class CombatCardManager {
    onCombatEnd() {
        // Fade out player hand cards
        this.playerHand.forEach(card => {
            this.scene.tweens.add({
                targets: card.container,
                alpha: 0,
                duration: 800,
                ease: 'Power1',
                onComplete: () => {
                    card.obliterate();
                }
            });
        });

        // Fade out enemy cards
        this.enemyUnits.forEach(card => {
            this.scene.tweens.add({
                targets: card.container, 
                alpha: 0,
                duration: 800,
                ease: 'Power1',
                onComplete: () => {
                    card.obliterate();
                }
            });
        });

        // Clear stored enemy positions
        this.enemyPositions.clear();
    }
    private scene: Phaser.Scene;
    public playerHand: PhysicalCard[] = [];
    public enemyUnits: PhysicalCard[] = [];
    public playerUnits: PhysicalCard[] = [];
    public cargoHolderCard?: PhysicalCard;
    public drawPile!: PhysicalCard;
    public discardPile!: PhysicalCard;
    public exhaustPile!: PhysicalCard;
    private enemyPositions: Map<string, { x: number, y: number }> = new Map();
    private enemyPositionManager: EnemyPositionManager;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        
        // Calculate battlefield bounds - adjust these values as needed
        const battlefieldBounds = new Phaser.Geom.Rectangle(
            300, // x position
            CombatSceneLayoutUtils.getBattlefieldY(this.scene) - 100, // y position, adjusted from -200 to -100
            this.scene.scale.width - 600, // width
            400 // height
        );
        
        this.enemyPositionManager = new EnemyPositionManager(battlefieldBounds);
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

        // Create cargo holder card below the last player unit
        const cargoHolder = GameState.getInstance().currentVessel;
        const lastPlayerY = 100 + (playerCharacters.length - 1) * 180;
        const cargoY = lastPlayerY + 180; // Position below last player

        this.cargoHolderCard = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: this.scene.scale.width - 100,
            y: cargoY,
            data: cargoHolder,
            onCardCreatedEventCallback: (card: PhysicalCard) => {
                card.container.setInteractive(false);
                card.data.size = CardSize.TINY;
                card.container.setScrollFactor(0);
            }
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
                    // If enemy cards should be draggable
                    this.scene.input.setDraggable(card.container);
                }
            });
            if (enemy instanceof AutomatedCharacter
                && enemy.intents.length === 0
            ) {
                enemy.setNewIntents();
            }
            enemyCard.container.setDepth(depthManager.CARD_BASE);
            this.enemyUnits.push(enemyCard);
        });
    }

    private createDrawAndDiscardPiles(): void {
        const gameWidth = this.scene.scale.width;
        const pileY = CombatSceneLayoutUtils.getPileY(this.scene);

        this.exhaustPile = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: gameWidth * 0.3,
            y: pileY,
            data: new UiCard({ name: 'Exhaust Pile (0)', description: 'Exhausted cards', portraitName: "exhaustpile",tint:0x800080,size:CardSize.TINY }),
            onCardCreatedEventCallback: (card: PhysicalCard) => {
                card.container.setInteractive();
                card.container.on('pointerdown', () => {
                    this.scene.events.emit('exhaustPileClicked');
                });
                card.data.size = CardSize.TINY;
            }
        });

        this.drawPile = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: gameWidth * 0.1,
            y: pileY,
            data: new UiCard({ name: 'Draw Pile (0)', description: 'Cards to draw', portraitName: "abstract-059" , tint:0x008000,size:CardSize.TINY }),
            onCardCreatedEventCallback: (card: PhysicalCard) => {
                // Make draw pile interactive
                card.container.setInteractive();
                card.data.size = CardSize.TINY;

                card.container.on('pointerdown', () => {
                    this.scene.events.emit('drawPileClicked');
                });
            }
        });

        this.discardPile = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: gameWidth * 0.2,
            y: pileY,
            data: new UiCard({ name: 'Discard Pile (0)', description: 'Discarded cards',     portraitName: "abstract-069" , tint:0xFF0000,size:CardSize.TINY  }),
            onCardCreatedEventCallback: (card: PhysicalCard) => {
                // Make discard pile interactive
                card.container.setInteractive();
                card.container.on('pointerdown', () => {
                    this.scene.events.emit('discardPileClicked');
                });
                card.data.size = CardSize.TINY;

                card.container.on('pointerover', () => {
                    // Bring the card to the top within its parent container
                    if (card.container.parentContainer) {
                        card.container.parentContainer.bringToTop(card.container);
                    }
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
                if (!physicalCard.data.transientUiFlag_disableStandardDiscardAfterPlay){ 
                    this.discardCardAnimation(physicalCard);
                }
            }
        });

        // Add new cards to hand
        state.currentHand.forEach(abstractCard => {
            if (!existingCards.has(abstractCard.id)) {
                const newCard = this.animateCardDraw(abstractCard as IAbstractCard);
                this.playerHand.push(newCard);
                newCard.data.transientUiFlag_disableStandardDiscardAfterPlay = false;
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
            const drawPileCount = state.drawPile.length;
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

    public updateExhaustPileCount(): void {
        if (this.exhaustPile) {
            const state = GameState.getInstance().combatState;
            const exhaustPileCount = state.currentExhaustPile.length;
            this.exhaustPile.data.name = `Exhaust Pile (${exhaustPileCount})`;
            this.exhaustPile.nameBox.setText(this.exhaustPile.data.name);
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
        [...this.playerHand, ...this.enemyUnits, ...this.playerUnits, 
         this.drawPile, this.discardPile, this.exhaustPile].forEach(card => {
            if (card && card.container) {
                card.container.setScrollFactor(0);
            }
        });

        // Also set scroll factor for cargo holder
        if (this.cargoHolderCard?.container) {
            this.cargoHolderCard.container.setScrollFactor(0);
        }

        // Add new section to sync enemy cards with game state
        this.syncEnemyCardsWithGameState();

        // Update draw and discard pile names to reflect current counts
        this.updateDrawPileCount();
        this.updateDiscardPileCount();
        this.updateExhaustPileCount();
    }

    private syncEnemyCardsWithGameState(): void {
        const state = GameState.getInstance().combatState;
        const existingEnemyCards = new Map(this.enemyUnits.map(card => [card.data.id, card]));

        // Create cards for new enemies
        state.enemies.forEach((enemy) => {
            if (!existingEnemyCards.has(enemy.id)) {
                if (enemy.isDead()) {
                    return;
                }

                const position = this.enemyPositionManager.placeEnemyAtOpenPosition(enemy.id);
                if (!position) {
                    console.warn(`No position available for enemy ${enemy.id}`);
                    return;
                }

                const enemyCard = CardGuiUtils.getInstance().createCard({
                    scene: this.scene,
                    x: position.x,
                    y: position.y,
                    data: enemy,
                    onCardCreatedEventCallback: (card: PhysicalCard) => {
                        card.container.setInteractive({
                            hitArea: card.cardBackground,
                            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                            useHandCursor: true
                        });
                        this.scene.input.setDraggable(card.container);
                    }
                });

                if (enemy instanceof AutomatedCharacter && enemy.intents.length === 0) {
                    enemy.setNewIntents();
                }

                enemy.physicalCard = enemyCard;
                enemy.team = Team.ENEMY;
                enemyCard.container.setDepth(DepthManager.getInstance().CARD_BASE);
                this.enemyUnits.push(enemyCard);

                // Fade in animation for new enemy cards
                enemyCard.container.setAlpha(0);
                this.scene.tweens.add({
                    targets: enemyCard.container,
                    alpha: 1,
                    duration: 500,
                    ease: 'Power2'
                });
            } else {
                // Check if existing enemy is dead and needs cleanup
                const existingCard = existingEnemyCards.get(enemy.id);
                if (existingCard && enemy.isDead()) {
                    this.removeEnemyCard(existingCard);
                }
            }
        });

        // Remove cards for enemies that no longer exist
        this.enemyUnits.forEach(card => {
            if (!state.enemies.some(enemy => enemy.id === card.data.id)) {
                this.removeEnemyCard(card);
            }
        });
    }

    public removeEnemyCard(enemyCard: PhysicalCard): void {
        this.enemyPositionManager.releasePosition(enemyCard.data.id);
        this.enemyUnits = this.enemyUnits.filter(card => card !== enemyCard);
        // Check if there are any active tweens on this card's container
        const activeTweens = this.scene.tweens.getTweensOf(enemyCard.container);
        if (activeTweens.length === 0) {

            // Fade and scale down animation
            this.scene.tweens.add({
                targets: enemyCard.container,
                alpha: 0,
                scaleX: 0.1,
                scaleY: 0.1,
                duration: 800,
                ease: 'Power2',
                onComplete: () => {
                    enemyCard.obliterate();
                    this.enemyUnits = this.enemyUnits.filter(card => card !== enemyCard);
                }
            });
        }
    }

    public cleanup(): void {
        // Clean up player hand
        this.playerHand.forEach(card => card.obliterate());
        this.playerHand = [];

        // Clean up enemy units
        this.enemyUnits.forEach(card => card.obliterate());
        this.enemyUnits = [];

        // Clean up player units
        this.playerUnits.forEach(card => card.obliterate());
        this.playerUnits = [];

        // Clean up piles
        if (this.drawPile) this.drawPile.obliterate();
        if (this.discardPile) this.discardPile.obliterate();
        if (this.exhaustPile) this.exhaustPile.obliterate();

        this.enemyPositionManager.reset();

        // Clean up cargo holder card
        if (this.cargoHolderCard) {
            this.cargoHolderCard.obliterate();
            this.cargoHolderCard = undefined;
        }
    }
}

export default CombatCardManager;
