// src/managers/CombatCardManager.ts

import Phaser from 'phaser';
import { AbstractCard, UiCard } from '../../gamecharacters/AbstractCard';
import { AutomatedCharacter } from '../../gamecharacters/AutomatedCharacter';
import { IAbstractCard } from '../../gamecharacters/IAbstractCard';
import type { PlayableCard } from '../../gamecharacters/PlayableCard';
import { GameState } from '../../rules/GameState';
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
                onCardCreatedEventCallback: () => { }
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
                GameState.getInstance().combatState.currentDiscardPile.push(card.data as PlayableCard);
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
            (unit as any).isPlayerUnit = true;
            this.playerUnits.push(unit);
        });
    }

    private createEnemyCards(): void {
        const enemies = GameState.getInstance().combatState.enemies;
        const cardWidth = 150; // Define card width
        enemies.forEach((enemy, index) => {
            const enemyCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: 400 + index * (cardWidth * 2), // Ensure separation of one card's width
                y: CombatSceneLayoutUtils.getBattlefieldY(this.scene),
                data: enemy,
                onCardCreatedEventCallback: () => { }
            });
            if (enemy instanceof AutomatedCharacter) {
                enemy.setNewIntents();
            }
            enemyCard.container.setDepth(1);
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
            onCardCreatedEventCallback: () => { }
        });

        this.discardPile = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: gameWidth * 0.2,
            y: pileY,
            data: new UiCard({ name: 'Discard Pile (0)', description: 'Discarded cards', portraitName: "discardpile" }),
            onCardCreatedEventCallback: () => { }
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
            onCardCreatedEventCallback: () => { }
        });
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

    public update(): void {
        const state = GameState.getInstance().combatState.currentHand;
        const stateIds = new Set(state.map(card => card.id));
        const handIds = new Set(this.playerHand.map(card => card.data.id));

        // Identify cards to add
        const cardsToAdd = state.filter(card => !handIds.has(card.id));
        cardsToAdd.forEach(cardData => {
            const newCard = this.animateCardDraw(cardData);
            this.playerHand.push(newCard);
        });

        // Identify cards to remove
        const cardsToRemove = this.playerHand.filter(card => !stateIds.has(card.data.id));
        cardsToRemove.forEach(card => {
            this.discardCardAnimation(card);
        });

        // Arrange the hand after updates
        this.arrangeCards(this.playerHand, CombatSceneLayoutUtils.getHandY(this.scene));

        this.updateDiscardPileCount();
        this.updateDrawPileCount();
    }

}

export default CombatCardManager;
