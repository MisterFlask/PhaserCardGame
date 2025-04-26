// src/managers/CombatInputHandler.ts

import Phaser from 'phaser';
import type { AbstractCard } from '../../gamecharacters/AbstractCard';
import { TargetingType } from '../../gamecharacters/AbstractCard';
import { BaseCharacter } from '../../gamecharacters/BaseCharacter';
import { IAbstractCard } from '../../gamecharacters/IAbstractCard';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { GameState } from '../../rules/GameState';
import { PlayableCardType } from '../../Types';
import { CardDragArrow } from '../../ui/CardDragArrow';
import { DepthManager } from '../../ui/DepthManager';
import CombatSceneLayoutUtils from '../../ui/LayoutUtils';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { PhysicalConsumable } from '../../ui/PhysicalConsumable';
import { TransientUiState } from '../../ui/TransientUiState';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { ActionManager } from '../../utils/ActionManager';
import CombatCardManager from './CombatCardManager';
import CombatUIManager from './CombatUiManager';

class CombatInputHandler {
    private scene: Phaser.Scene;
    private cardManager: CombatCardManager;
    private originalCardPosition: { x: number; y: number } | null = null;
    private cardClickListeners: ((card: AbstractCard) => void)[] = [];
    private isInteractionEnabled: boolean = true;
    private transientUiState = TransientUiState.getInstance();
    private cardDragArrow: CardDragArrow | null = null;
    private dragStartPosition: { x: number, y: number } | null = null;
    
    // Consumable-related properties
    private consumableDragArrow: CardDragArrow | null = null;
    private draggedConsumable: PhysicalConsumable | null = null;
    private originalConsumablePosition: { x: number; y: number } | null = null;

    constructor(scene: Phaser.Scene, cardManager: CombatCardManager) {
        this.scene = scene;
        this.cardManager = cardManager;
        this.setupEventListeners();
        this.setupCardClickListeners();

        this.scene.events.on('toggleInteraction', this.toggleInteraction, this);
    }

    private setupEventListeners(): void {
        this.scene.input.on('dragstart', this.handleDragStart, this);
        this.scene.input.on('drag', this.handleDrag, this);
        this.scene.input.on('dragend', this.handleDragEnd, this);
        this.scene.input.on('gameobjectover', this.handleGameObjectOver, this);
        this.scene.input.on('gameobjectout', this.handleGameObjectOut, this);
        // Global pointer for consumables
        this.scene.input.on('pointermove', this.handleGlobalConsumableMove, this);
        this.scene.input.on('pointerup', this.handleGlobalConsumableUp, this);
        // Listen for consumable drag start to show arrow
        this.scene.events.on('consumabledragstart', this.handleConsumableDragStartGlobal, this);

        this.scene.events.on('shutdown', this.removeEventListeners, this);
    }

    private removeEventListeners(): void {
        this.scene.input.off('dragstart', this.handleDragStart, this);
        this.scene.input.off('drag', this.handleDrag, this);
        this.scene.input.off('dragend', this.handleDragEnd, this);
        this.scene.input.off('gameobjectover', this.handleGameObjectOver, this);
        this.scene.input.off('gameobjectout', this.handleGameObjectOut, this);
        this.scene.input.off('pointermove', this.handleGlobalConsumableMove, this);
        this.scene.input.off('pointerup', this.handleGlobalConsumableUp, this);
        this.scene.events.off('consumabledragstart', this.handleConsumableDragStartGlobal, this);
        this.scene.events.off('shutdown', this.removeEventListeners, this);
    }

    private setupCardClickListeners(): void {
        const allCards = [
            ...this.cardManager.playerHand,
            ...this.cardManager.enemyUnits,
            ...this.cardManager.playerUnits
        ];

        allCards.forEach(card => {
            // Ensure the container is interactive
            card.container.setInteractive({
                hitArea: card.cardBackground,
                hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                useHandCursor: true  // Add cursor hint
            });


            // Additional debug logging
            card.container.on('pointerover', () => {
                console.log(`Pointer over card: ${card.data.name}`);
            });

            card.container.on('pointerout', () => {
                console.log(`Pointer out card: ${card.data.name}`);
            });
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

    private handleDragStart(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;

        // Handle card dragging
        const card = this.getCardFromGameObject(gameObject);
        if (card) {
            // Store the original position
            this.dragStartPosition = {
                x: card.container.x,
                y: card.container.y
            };

            // Create the drag arrow if it doesn't exist
            if (!this.cardDragArrow) {
                this.cardDragArrow = new CardDragArrow(this.scene, 0, 0);
                this.cardDragArrow.setDepth(DepthManager.getInstance().COMBAT_UI);
            }

            // Set up the arrow
            this.cardDragArrow.setStartPoint(card.container.x, card.container.y);
            this.cardDragArrow.setEndPoint(pointer.x, pointer.y);
            this.cardDragArrow.show();

            // Set up the drag state
            this.transientUiState.setDraggedCard(card);
        }
    }

    private handleDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number): void {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;
        
        // Handle card dragging
        if (this.transientUiState.draggedCard && this.cardDragArrow) {
            // Update the arrow end point instead of moving the card
            this.cardDragArrow.setEndPoint(pointer.x, pointer.y);
            this.checkCardUnderPointer(pointer);

            // Update arrow color based on target validity
            const draggedCard = this.transientUiState.draggedCard;
            const hoveredCard = this.transientUiState.hoveredCard;
            
            if (draggedCard.data.isPlayableCard()) {
                const playableCard = draggedCard.data as PlayableCardType;
                const hasValidTarget = hoveredCard && this.isValidTarget(playableCard, hoveredCard.data);
                this.cardDragArrow.setValidTarget(hasValidTarget || false);
            }
        }
    }

    private handleDragEnd(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;

        // Handle card drag end
        if (this.transientUiState.draggedCard) {
            // Hide and clean up the arrow
            if (this.cardDragArrow) {
                this.cardDragArrow.hide();
            }

            console.log('handleDragEnd: Starting drag end handling');

            const draggedCard = this.transientUiState.draggedCard;
            if (!draggedCard) {
                console.log('handleDragEnd: No card being dragged, resetting state');
                this.resetDragState()
                return;
            }

            const isPlayable = draggedCard.data instanceof PlayableCard;
            console.log(`handleDragEnd: Card ${draggedCard.data.name} isPlayable: ${isPlayable}`);

            let wasPlayed = false;
            var target = this.transientUiState.hoveredCard?.data as BaseCharacter;
            if (isPlayable) {
                const playableCard = draggedCard.data as PlayableCard;
                const targetingType = this.getTargetingType(playableCard);
                console.log(`handleDragEnd: Card targeting type: ${targetingType}`);
                var canPlayResult = ActionManager.getInstance().getCanPlayCardResult(draggedCard, target)
                if (targetingType === TargetingType.NO_TARGETING && !canPlayResult.canPlay) {
                    console.log('handleDragEnd: Cannot play no-target card');
                    ActionManager.getInstance().displaySubtitle_NoQueue(canPlayResult.reason || "Unknown reason", 2000);
                    wasPlayed = false;
                }
                else if (!canPlayResult.canPlay) {
                    console.log('handleDragEnd: Cannot play card on target');
                    ActionManager.getInstance().displaySubtitle_NoQueue(canPlayResult.reason || "Unknown reason", 2000);
                    wasPlayed = false;
                }
                else if (targetingType === TargetingType.NO_TARGETING) {
                    const droppedOnBattlefield = CombatSceneLayoutUtils.isDroppedOnBattlefield(this.scene, pointer);
                    console.log(`handleDragEnd: No-target card dropped on battlefield: ${droppedOnBattlefield}`);
                    if (droppedOnBattlefield) {
                        wasPlayed = true;
                        this.playCardOnBattlefield(draggedCard);
                    }
                } else if (target) {
                    console.log(`handleDragEnd: Checking if can play on target: ${target.name}`);
                    if (this.transientUiState.hoveredCard && this.isValidTarget(playableCard, this.transientUiState.hoveredCard.data)) {
                        console.log('handleDragEnd: Valid target found, playing card');
                        wasPlayed = true;
                        this.playCardOnTarget(playableCard, target);
                    }
                }else{
                    console.log('handleDragEnd: No valid target found');
                    wasPlayed = false;
                }
            }

            console.log(`handleDragEnd: Card was${wasPlayed ? '' : ' not'} played`);
            if (!wasPlayed) {
                this.animateCardBack();
            } else {
                this.removeCardFromHand(draggedCard || undefined);
                this.addCardToDiscardPile(draggedCard!);
            }

            console.log('handleDragEnd: Resetting drag state');
            this.resetDragState();
        }
    }

    private handleGameObjectOver = (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void => {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;
        if (gameObject instanceof Phaser.GameObjects.Container && (gameObject as any).physicalCard instanceof PhysicalCard) {
            const physicalCard = (gameObject as any).physicalCard as PhysicalCard;
            physicalCard.container.setDepth(DepthManager.getInstance().CARD_HOVER);
            this.transientUiState.setHoveredCard(physicalCard);
        }
    }

    private handleGameObjectOut = (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void => {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;
        if (gameObject instanceof Phaser.GameObjects.Container && (gameObject as any).physicalCard instanceof PhysicalCard) {
            const physicalCard = (gameObject as any).physicalCard as PhysicalCard;
            physicalCard.container.setDepth(DepthManager.getInstance().CARD_BASE);
            if (this.transientUiState.hoveredCard === physicalCard) {
                this.transientUiState.setHoveredCard(null);
            }
        }
    }

    private getTargetingType(card: PlayableCard): TargetingType {
        return card.targetingType;
    }

    private isValidTarget(card: PlayableCard, target: IAbstractCard): boolean {
        return card.isValidTarget(target);
    }

    private isValidConsumableTarget(consumable: any, target: BaseCharacter): boolean {
        // Check targeting type of consumable
        const targetingType = consumable.targetingType;
        
        // Cannot target dead characters
        if (target.isDead()) {
            return false;
        }

        // Handle different targeting types
        switch (targetingType) {
            case TargetingType.ALLY:
                return target.isPlayerCharacter();
            case TargetingType.ENEMY:
                return !target.isPlayerCharacter();
            case TargetingType.NO_TARGETING:
                return false; // No-targeting consumables shouldn't need a target
            default:
                return false;
        }
    }

    private playCardOnBattlefield(card: PhysicalCard): void {
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
                card.obliterate(); // Remove the card after animation
            }
        });
    }

    private animateCardBack(): void {
        if (this.transientUiState.draggedCard) {
            this.scene.tweens.add({
                targets: this.transientUiState.draggedCard.container,
                x: CombatSceneLayoutUtils.getCardPositionInHand(this.scene, this.cardManager.playerHand.indexOf(this.transientUiState.draggedCard), this.cardManager.playerHand).x,
                y: CombatSceneLayoutUtils.getHandY(this.scene),
                scaleX: 1,
                scaleY: 1,
                alpha: 1,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.cardManager.arrangeCards(
                        this.cardManager.playerHand, 
                        CombatSceneLayoutUtils.getHandY(this.scene)
                    );
                }
            });
        } else {
            this.cardManager.arrangeCards(
                this.cardManager.playerHand, 
                CombatSceneLayoutUtils.getHandY(this.scene)
            );
        }
    }

    private animateConsumableBack(consumable: PhysicalConsumable): void {
        if (consumable) {
            const originalPosition = consumable.getOriginalPosition();
            if (originalPosition) {
                this.scene.tweens.add({
                    targets: consumable,
                    x: originalPosition.x,
                    y: originalPosition.y,
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => {
                        // Rearrange all consumables
                        CombatUIManager.getInstance().arrangeConsumables();
                    }
                });
            }
        }
    }

    private resetDragState(): void {
        if (this.cardDragArrow) {
            this.cardDragArrow.destroy();
            this.cardDragArrow = null;
        }
        this.dragStartPosition = null;
        this.transientUiState.setDraggedCard(null);
        this.transientUiState.setHoveredCard(null);
        this.transientUiState.setHoveredIntent(null);
    }

    private checkCardUnderPointer(pointer: Phaser.Input.Pointer): void {
        const cardUnderPointer = this.getCardUnderPointer(pointer);

        if (cardUnderPointer && cardUnderPointer !== this.transientUiState.draggedCard) {
            if (this.transientUiState.hoveredCard !== cardUnderPointer) {
                this.transientUiState.setHoveredCard(cardUnderPointer);
            }
        } else if (this.transientUiState.hoveredCard) {
            this.transientUiState.setHoveredCard(null);
        }
    }

    private getCardUnderPointer(pointer: Phaser.Input.Pointer): PhysicalCard | null {
        const allCards = [...this.cardManager.playerHand, ...this.cardManager.enemyUnits, ...this.cardManager.playerUnits];
        for (let i = allCards.length - 1; i >= 0; i--) {
            const card = allCards[i];
            if (card !== this.transientUiState.draggedCard && card.cardBackground.getBounds().contains(pointer.x, pointer.y)) {
                return card;
            }
        }
        return null;
    }

    private getCardFromGameObject(gameObject: Phaser.GameObjects.GameObject): PhysicalCard | null {
        if (gameObject instanceof Phaser.GameObjects.Container && (gameObject as any).physicalCard instanceof PhysicalCard) {
            return (gameObject as any).physicalCard as PhysicalCard;
        }
        return null;
    }

    public removeCardClickListener(listener: (card: AbstractCard) => void): void {
        this.cardClickListeners = this.cardClickListeners.filter(l => l !== listener);
    }

    private toggleInteraction = (enable: boolean): void => {
        this.isInteractionEnabled = enable;
        if (!enable) {
            // Reset any ongoing interactions
            if (this.transientUiState.draggedCard) {
                this.handleDragEnd(null as any, null as any);
            }
            if (this.transientUiState.draggedConsumable) {
                this.animateConsumableBack(this.transientUiState.draggedConsumable);
                this.transientUiState.setDraggedConsumable(null);
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
                // More comprehensive interactive setup
                card.container.setInteractive({
                    hitArea: card.cardBackground,
                    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                    useHandCursor: true
                });
                
            } else {
                card.container.removeInteractive();
            }
        });

        // Disable/enable interactions for consumables
        const uiManager = CombatUIManager.getInstance();
        uiManager.activeConsumables.forEach(consumable => {
            if (enable) {
                consumable.setupInteractivity();
                consumable.currentlyActivatable = true;
            } else {
                consumable.disableInteractive();
                consumable.currentlyActivatable = false;
            }
        });
    }

    public cleanup(): void {
        this.resetDragState();
        if (this.transientUiState.draggedConsumable) {
            this.transientUiState.setDraggedConsumable(null);
        }
    }

    private handleGlobalConsumableMove(pointer: Phaser.Input.Pointer): void {
        const consumable = this.transientUiState.draggedConsumable;
        if (consumable && this.cardDragArrow) {
            // Update arrow endpoint
            this.cardDragArrow.setEndPoint(pointer.x, pointer.y);
            this.checkCardUnderPointer(pointer);

            // Update arrow color based on valid target
            const hoveredCard = this.transientUiState.hoveredCard;
            let valid = false;
            if (hoveredCard && hoveredCard.data instanceof BaseCharacter) {
                valid = this.isValidConsumableTarget(consumable.abstractConsumable, hoveredCard.data);
            }
            this.cardDragArrow.setValidTarget(valid);
        }
    }

    private handleGlobalConsumableUp(pointer: Phaser.Input.Pointer): void {
        // Always hide and destroy any arrow (for cards or consumables)
        if (this.cardDragArrow) {
            this.cardDragArrow.hide();
            this.cardDragArrow.destroy();
            this.cardDragArrow = null;
        }
        const consumable = this.transientUiState.draggedConsumable;
        if (!consumable) {
            return;
        }

        // Try to use consumable
        const hoveredCard = this.transientUiState.hoveredCard;
        if (hoveredCard && hoveredCard.data instanceof BaseCharacter) {
            const target = hoveredCard.data as BaseCharacter;
            if (this.isValidConsumableTarget(consumable.abstractConsumable, target)) {
                const used = consumable.abstractConsumable.onUse(target);
                if (used) {
                    consumable.usesLeft = Math.max(0, (consumable.usesLeft || 0) - 1);
                    consumable.updateUsesDisplay();
                    if (consumable.usesLeft <= 0) {
                        consumable.consumableImage.setAlpha(0.5);
                        consumable.currentlyActivatable = false;
                    }
                } else {
                    ActionManager.getInstance().displaySubtitle_NoQueue('Cannot use consumable', 2000);
                }
            } else {
                ActionManager.getInstance().displaySubtitle_NoQueue('Invalid target', 2000);
            }
        }
        // Animate back
        this.animateConsumableBack(consumable);
        // Reset state
        this.transientUiState.setDraggedConsumable(null);
    }

    private handleConsumableDragStartGlobal(consumable: PhysicalConsumable, pointer: Phaser.Input.Pointer): void {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;
        // Create the drag arrow if it doesn't exist
        if (!this.cardDragArrow) {
            this.cardDragArrow = new CardDragArrow(this.scene, 0, 0);
            this.cardDragArrow.setDepth(DepthManager.getInstance().COMBAT_UI);
        }
        // Compute the absolute start position of the consumable
        let startX = consumable.x;
        let startY = consumable.y;
        if (consumable.parentContainer) {
            startX += consumable.parentContainer.x;
            startY += consumable.parentContainer.y;
        }
        // Initialize arrow at consumable center
        this.cardDragArrow.setStartPoint(startX, startY);
        // Use pointer position as initial end point
        this.cardDragArrow.setEndPoint(pointer.x, pointer.y);
        this.cardDragArrow.show();
    }
}

export default CombatInputHandler;
