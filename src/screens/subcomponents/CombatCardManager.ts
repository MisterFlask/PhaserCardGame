// src/managers/CombatCardManager.ts

import Phaser from 'phaser';
import { AbstractCard, UiCard } from '../../gamecharacters/AbstractCard';
import { AutomatedCharacter } from '../../gamecharacters/AutomatedCharacter';
import { GameState } from '../../rules/GameState';
import LayoutUtils from '../../ui/LayoutUtils';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { CardGuiUtils } from '../../utils/CardGuiUtils';

class CombatCardManager {
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
                y: LayoutUtils.getHandY(this.scene),
                data: cardData,
                eventCallback: () => { }
            });
            this.playerHand.push(card);
        });
        this.arrangeCards(this.playerHand, LayoutUtils.getHandY(this.scene));
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
                eventCallback: () => { }
            });
            (unit as any).isPlayerUnit = true;
            this.playerUnits.push(unit);
        });
    }

    private createEnemyCards(): void {
        const enemies = GameState.getInstance().combatState.enemies;
        enemies.forEach((enemy, index) => {
            const enemyCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: 400 + index * 150,
                y: LayoutUtils.getBattlefieldY(this.scene),
                data: enemy,
                eventCallback: () => { }
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
        const pileY = LayoutUtils.getPileY(this.scene);

        this.drawPile = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: gameWidth * 0.1,
            y: pileY,
            data: new UiCard({ name: 'Draw Pile (0)', description: 'Cards to draw', portraitName: "drawpile" }),
            eventCallback: () => { }
        });

        this.discardPile = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: gameWidth * 0.2,
            y: pileY,
            data: new UiCard({ name: 'Discard Pile (0)', description: 'Discarded cards', portraitName: "discardpile" }),
            eventCallback: () => { }
        });
    }

    public arrangeCards(cardArray: PhysicalCard[], yPosition: number): void {
        LayoutUtils.arrangeCards(this.scene, cardArray, yPosition);
    }

    public syncHandWithGameState(): void {
        const state = GameState.getInstance().combatState;
        const existingCards = new Map(this.playerHand.map(card => [card.data.id, card]));

        // Remove cards no longer in hand
        existingCards.forEach((physicalCard, id) => {
            if (!state.currentHand.some(c => c.id === id)) {
                this.discardCard(physicalCard);
            }
        });

        // Add new cards to hand
        state.currentHand.forEach(abstractCard => {
            if (!existingCards.has(abstractCard.id)) {
                const newCard = this.animateCardDraw(abstractCard);
                this.playerHand.push(newCard);
            }
        });

        // Remove discarded cards from hand
        this.playerHand = this.playerHand.filter(card => state.currentHand.some(c => c.id === card.data.id));

        // Arrange the hand
        this.arrangeCards(this.playerHand, LayoutUtils.getHandY(this.scene));
    }

    private animateCardDraw(data: AbstractCard): PhysicalCard {
        const card = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: this.drawPile.container.x,
            y: this.drawPile.container.y,
            data: data,
            eventCallback: () => { }
        });
        card.container.setScale(0.5);
        card.container.setAlpha(0);

        // Animate the card moving to the hand
        this.scene.tweens.add({
            targets: card.container,
            x: card.container.x,
            y: LayoutUtils.getHandY(this.scene),
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });

        return card;
    }

    private discardCard(card: PhysicalCard): void {
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
            (this.drawPile.container.getByName('nameBox') as Phaser.GameObjects.Text).setText(this.drawPile.data.name);
        }
    }

    public updateDiscardPileCount(): void {
        if (this.discardPile) {
            const state = GameState.getInstance().combatState;
            const discardPileCount = state.currentDiscardPile.length;
            this.discardPile.data.name = `Discard Pile (${discardPileCount})`;
            (this.discardPile.container.getByName('nameBox') as Phaser.GameObjects.Text).setText(this.discardPile.data.name);
        }
    }

    // Additional card management methods...
}

export default CombatCardManager;