// src/managers/CombatInputHandler.ts

import Phaser from 'phaser';
import type { AbstractCard } from '../../gamecharacters/AbstractCard';
import { TargetingType } from '../../gamecharacters/AbstractCard';
import { BaseCharacter } from '../../gamecharacters/BaseCharacter';
import { IAbstractCard } from '../../gamecharacters/IAbstractCard';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { GameState } from '../../rules/GameState';
import CombatSceneLayoutUtils from '../../ui/LayoutUtils';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { PhysicalIntent } from '../../ui/PhysicalIntent';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { ActionManager } from '../../utils/ActionManager';
import { IntentEmitter } from '../../utils/IntentEmitter';
import CombatCardManager from './CombatCardManager';

class CombatInputHandler {
    private scene: Phaser.Scene;
    private cardManager: CombatCardManager;
    public static draggedCard: PhysicalCard | null = null;
    private originalCardPosition: { x: number; y: number } | null = null;
    private highlightedCard: PhysicalCard | null = null;
    private cardClickListeners: ((card: AbstractCard) => void)[] = [];
    private isInteractionEnabled: boolean = true;

    constructor(scene: Phaser.Scene, cardManager: CombatCardManager) {
        this.scene = scene;
        this.cardManager = cardManager;
        this.setupEventListeners();
        this.setupCardClickListeners();

        IntentEmitter.getInstance().on(IntentEmitter.EVENT_INCOMING_INTENT_HOVER, this.onIncomingIntentHover, this);
        IntentEmitter.getInstance().on(IntentEmitter.EVENT_INCOMING_INTENT_HOVER_END, this.onIncomingIntentHoverEnd, this);
        this.scene.events.on('toggleInteraction', this.toggleInteraction, this);
    }

    private setupEventListeners(): void {
        this.scene.input.on('dragstart', this.handleDragStart, this);
        this.scene.input.on('drag', this.handleDrag, this);
        this.scene.input.on('dragend', this.handleDragEnd, this);
        this.scene.input.on('gameobjectover', this.handleGameObjectOver, this);
        this.scene.input.on('gameobjectout', this.handleGameObjectOut, this);

        this.scene.events.on('shutdown', this.removeEventListeners, this);

        // Changed to listen on IntentEmitter instance
        IntentEmitter.getInstance().on(IntentEmitter.EVENT_INTENT_HOVER, this.handleIntentHoverOver, this);
        IntentEmitter.getInstance().on(IntentEmitter.EVENT_INTENT_HOVER_END, this.handleIntentHoverOut, this);
    }

    private removeEventListeners(): void {
        this.scene.input.off('dragstart', this.handleDragStart, this);
        this.scene.input.off('drag', this.handleDrag, this);
        this.scene.input.off('dragend', this.handleDragEnd, this);
        this.scene.input.off('gameobjectover', this.handleGameObjectOver, this);
        this.scene.input.off('gameobjectout', this.handleGameObjectOut, this);

        this.scene.events.off('shutdown', this.removeEventListeners, this);

        // Changed to remove listeners from IntentEmitter instance
        IntentEmitter.getInstance().off(IntentEmitter.EVENT_INTENT_HOVER, this.handleIntentHoverOver, this);
        IntentEmitter.getInstance().off(IntentEmitter.EVENT_INTENT_HOVER_END, this.handleIntentHoverOut, this);

        this.removeCardClickListeners();
        this.cardClickListeners = []; // Clear all listeners
    }

    private setupCardClickListeners(): void {
        const allCards = [
            ...this.cardManager.playerHand,
            ...this.cardManager.enemyUnits,
            ...this.cardManager.playerUnits
        ];

        allCards.forEach(card => {
            const bounds = card.cardBackground.getBounds();
            card.container.setInteractive(new Phaser.Geom.Rectangle(0, 0, bounds.width, bounds.height), Phaser.Geom.Rectangle.Contains);
            card.container.on('pointerdown', () => this.handleCardClick(card));
        });
    }

    private removeCardClickListeners(): void {
        const allCards = [
            ...this.cardManager.playerHand,
            ...this.cardManager.enemyUnits,
            ...this.cardManager.playerUnits
        ];

        allCards.forEach(card => {
            card.container.off('pointerdown');
            //card.container.removeInteractive();
        });
    }

    private handleDragStart = (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void => {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;
        if ('physicalCard' in gameObject) {
            CombatInputHandler.draggedCard = (gameObject as any).physicalCard as PhysicalCard;
            if (CombatInputHandler.draggedCard) {
                this.originalCardPosition = { x: CombatInputHandler.draggedCard.container.x, y: CombatInputHandler.draggedCard.container.y };
                if (gameObject.parentContainer) {
                    this.bringCardToFront(gameObject.parentContainer);
                }
            }
        } else {
            console.warn('Dragged object is not a PhysicalCard');
            CombatInputHandler.draggedCard = null;
            this.originalCardPosition = null;
        }
    }

    private handleDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number): void {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;
        if (CombatInputHandler.draggedCard) {
            CombatInputHandler.draggedCard.container.x = dragX;
            CombatInputHandler.draggedCard.container.y = dragY;

            this.checkCardUnderPointer(pointer);
        }
    }

    

    private handleDragEnd(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;

        console.log('handleDragEnd triggered on CombatInputHandler');

        if (!CombatInputHandler.draggedCard) {
            console.log('error: no card being dragged');
            return;
        }

        const isPlayable = CombatInputHandler.draggedCard!.data instanceof PlayableCard;

        let wasPlayed = false;

        if (isPlayable) {
            const playableCard = CombatInputHandler.draggedCard!.data as PlayableCard;
            const targetingType = this.getTargetingType(playableCard);

            if (targetingType === TargetingType.NO_TARGETING) {
                const droppedOnBattlefield = CombatSceneLayoutUtils.isDroppedOnBattlefield(this.scene, pointer);
                if (droppedOnBattlefield) {
                    wasPlayed = true;
                    this.playCardOnBattlefield(CombatInputHandler.draggedCard);
                }
            } else {
                if (this.highlightedCard && this.isValidTarget(playableCard, this.highlightedCard.data)) {
                    wasPlayed = true;
                    this.playCardOnTarget(playableCard, this.highlightedCard.data as BaseCharacter);
                }
            }
        }

        if (!wasPlayed) {
            this.animateCardBack();
        } else {
            this.removeCardFromHand(CombatInputHandler.draggedCard || undefined);
            this.addCardToDiscardPile(CombatInputHandler.draggedCard!);
        }

        this.resetDragState();
    }

    private handleGameObjectOver = (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void => {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;
        if (gameObject instanceof Phaser.GameObjects.Container && (gameObject as any).physicalCard instanceof PhysicalCard) {
            const physicalCard = (gameObject as any).physicalCard as PhysicalCard;
            this.bringCardToFront(gameObject);
            this.highlightedCard = physicalCard;
        }
    }

    private handleGameObjectOut = (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void => {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;
        if (gameObject instanceof Phaser.GameObjects.Container && (gameObject as any).physicalCard instanceof PhysicalCard) {
            const physicalCard = (gameObject as any).physicalCard as PhysicalCard;
            this.resetCardDepth(gameObject);
            if (this.highlightedCard === physicalCard) {
                this.highlightedCard = null;
            }
        }
    }

    private bringCardToFront(container: Phaser.GameObjects.Container): void {
        this.scene.children.bringToTop(container);
    }

    private resetCardDepth(container: Phaser.GameObjects.Container): void {
        // Reset depth based on original logic or other criteria
        const originalDepth = (container as any).originalDepth || 4;
        container.setDepth(originalDepth);
    }

    private getTargetingType(card: PlayableCard): TargetingType {
        return card.targetingType;
    }

    private isValidTarget(card: PlayableCard, target: IAbstractCard): boolean {
        if (card.targetingType === TargetingType.NO_TARGETING) return true;

        if (target instanceof BaseCharacter) {
            if (card.targetingType === TargetingType.ENEMY) {
                return this.isEnemy(target);
            } else if (card.targetingType === TargetingType.ALLY) {
                return this.isAlly(target);
            }
        }
        return false;
    }

    private isAlly(target: BaseCharacter): boolean {
        // Implement actual ally checking logic
        return true;
    }

    private isEnemy(target: BaseCharacter): boolean {
        // Implement actual enemy checking logic
        return true;
    }

    private playCardOnBattlefield(card: PhysicalCard): void {
        const playableCard = card.data as PlayableCard;
        ActionManager.getInstance().playCard(card);
        console.log(`Card played on battlefield: ${card.data.name}`);
    }

    private playCardOnTarget(card: PlayableCard, target: BaseCharacter): void {
        ActionManager.getInstance().playCard(card.physicalCard as PhysicalCard, target);
    }

    private removeCardFromHand(card?: PhysicalCard): void {
        if (!card) return;
        this.cardManager.playerHand = this.cardManager.playerHand.filter(c => c !== card);
    }

    private addCardToDiscardPile(card: PhysicalCard): void {
        if (!card) return;

        this.scene.tweens.add({
            targets: card.container,
            x: this.cardManager.discardPile.container.x,
            y: this.cardManager.discardPile.container.y,
            scaleX: 0.5,
            scaleY: 0.5,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.cardManager.discardPile.data.name = `Discard Pile (${GameState.getInstance().combatState.currentDiscardPile.length + 1})`;
                this.cardManager.discardPile.nameBox.setText(this.cardManager.discardPile.data.name);
                GameState.getInstance().combatState.currentDiscardPile.push(card.data as PlayableCard);
                card.obliterate(); // Remove the card after animation
            }
        });
    }

    private animateCardBack(): void {
        if (CombatInputHandler.draggedCard && this.originalCardPosition) {
            this.scene.tweens.add({
                targets: CombatInputHandler.draggedCard.container,
                x: this.originalCardPosition.x,
                y: this.originalCardPosition.y,
                scaleX: 1,
                scaleY: 1,
                alpha: 1,
                duration: 300,
                ease: 'Power2'
            });
        } else {
            this.cardManager.arrangeCards(this.cardManager.playerHand, CombatSceneLayoutUtils.getHandY(this.scene));
        }
    }

    private resetDragState(): void {
        CombatInputHandler.draggedCard = null;
        this.originalCardPosition = null;
        this.highlightedCard = null;
    }

    private checkCardUnderPointer(pointer: Phaser.Input.Pointer): void {
        const cardUnderPointer = this.getCardUnderPointer(pointer);

        if (cardUnderPointer && cardUnderPointer !== CombatInputHandler.draggedCard) {
            if (this.highlightedCard !== cardUnderPointer) {
                if (this.highlightedCard) {
                    this.unhighlightCard(this.highlightedCard);
                }
                this.highlightedCard = cardUnderPointer;
                this.highlightCard(cardUnderPointer);
            }
        } else if (this.highlightedCard) {
            this.unhighlightCard(this.highlightedCard);
            this.highlightedCard = null;
        }
    }

    private getCardUnderPointer(pointer: Phaser.Input.Pointer): PhysicalCard | null {
        const allCards = [...this.cardManager.playerHand, ...this.cardManager.enemyUnits, ...this.cardManager.playerUnits];
        for (let i = allCards.length - 1; i >= 0; i--) {
            const card = allCards[i];
            if (card !== CombatInputHandler.draggedCard && card.cardBackground.getBounds().contains(pointer.x, pointer.y)) {
                return card;
            }
        }
        return null;
    }

    private highlightCard(card: PhysicalCard): void {
        card.highlight();
    }

    private unhighlightCard(card: PhysicalCard): void {
        card.unhighlight();
    }


    private handleIntentHoverOver(intent: PhysicalIntent): void {
        console.log('intent hover over');
        const targetCard = intent.intent.target;
        if (targetCard && targetCard.physicalCard) {
            this.highlightCard(targetCard.physicalCard as PhysicalCard);
        }
    }

    private handleIntentHoverOut(intent: PhysicalIntent): void {
        console.log('intent hover out');
        const targetCard = intent.intent.target;
        if (targetCard && targetCard.physicalCard) {
            this.unhighlightCard(targetCard.physicalCard as PhysicalCard);
        }
    }

    private onIncomingIntentHover(owner: BaseCharacter): void {
        const enemyPhysicalCard = owner.physicalCard as PhysicalCard;
        if (enemyPhysicalCard) {
            enemyPhysicalCard.highlight();
        }
    }

    private onIncomingIntentHoverEnd(owner: BaseCharacter): void {
        const enemyPhysicalCard = owner.physicalCard as PhysicalCard;
        if (enemyPhysicalCard) {
            enemyPhysicalCard.unhighlight();
        }
    }

    public addCardClickListener(listener: (card: AbstractCard) => void): void {
        this.cardClickListeners.push(listener);
    }

    public removeCardClickListener(listener: (card: AbstractCard) => void): void {
        this.cardClickListeners = this.cardClickListeners.filter(l => l !== listener);
    }

    private handleCardClick(card: PhysicalCard): void {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;
        this.cardClickListeners.forEach(listener => listener(card.data as AbstractCard));
    }

    private toggleInteraction = (enable: boolean): void => {
        this.isInteractionEnabled = enable;
        if (!enable) {
            // Reset any ongoing interactions
            if (CombatInputHandler.draggedCard) {
                this.handleDragEnd(null as any, null as any);
            }
        }
        
        // Disable/enable interactions for all cards
        const allCards = [
            ...this.cardManager.playerHand,
            ...this.cardManager.enemyUnits,
            ...this.cardManager.playerUnits
        ];

        allCards.forEach(card => {
            if (enable) {
                const bounds = card.cardBackground.getBounds();
                card.container.setInteractive(new Phaser.Geom.Rectangle(0, 0, bounds.width, bounds.height), Phaser.Geom.Rectangle.Contains);
            } else {
                card.container.removeInteractive();
            }
        });
    }
}

export default CombatInputHandler;
