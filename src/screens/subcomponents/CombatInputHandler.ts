// src/managers/CombatInputHandler.ts

import Phaser from 'phaser';
import type { AbstractCard } from '../../gamecharacters/AbstractCard';
import { TargetingType } from '../../gamecharacters/AbstractCard';
import { BaseCharacter } from '../../gamecharacters/BaseCharacter';
import { IAbstractCard } from '../../gamecharacters/IAbstractCard';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { GameState } from '../../rules/GameState';
import { DepthManager } from '../../ui/DepthManager';
import CombatSceneLayoutUtils from '../../ui/LayoutUtils';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { TransientUiState } from '../../ui/TransientUiState';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { ActionManager } from '../../utils/ActionManager';
import CombatCardManager from './CombatCardManager';

class CombatInputHandler {
    private scene: Phaser.Scene;
    private cardManager: CombatCardManager;
    private originalCardPosition: { x: number; y: number } | null = null;
    private cardClickListeners: ((card: AbstractCard) => void)[] = [];
    private isInteractionEnabled: boolean = true;
    private transientUiState = TransientUiState.getInstance();

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

        this.scene.events.on('shutdown', this.removeEventListeners, this);

    }

    private removeEventListeners(): void {
        this.scene.input.off('dragstart', this.handleDragStart, this);
        this.scene.input.off('drag', this.handleDrag, this);
        this.scene.input.off('dragend', this.handleDragEnd, this);
        this.scene.input.off('gameobjectover', this.handleGameObjectOver, this);
        this.scene.input.off('gameobjectout', this.handleGameObjectOut, this);

        this.scene.events.off('shutdown', this.removeEventListeners, this);


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
            // Ensure the container is interactive
            card.container.setInteractive({
                hitArea: card.cardBackground,
                hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                useHandCursor: true  // Add cursor hint
            });

            // Remove any existing listeners first to prevent duplicate bindings
            card.container.off('pointerdown');
            card.container.on('pointerdown', () => {
                console.log(`Attempting to handle click for card: ${card.data.name}`);
                const event = card.data.onClickLaunchEvent();
                if (event){
                    this.scene.events.emit('abstractEvent:launch', event);
                }
                this.handleCardClick(card);
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

    private handleDragStart = (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void => {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;
        if ('physicalCard' in gameObject) {
            const draggedCard = (gameObject as any).physicalCard as PhysicalCard;
            if (draggedCard) {
                // Kill any existing tweens on the card container
                this.scene.tweens.killTweensOf(draggedCard.container);
                
                this.originalCardPosition = { 
                    x: draggedCard.container.x, 
                    y: draggedCard.container.y 
                };
                draggedCard.container.setDepth(DepthManager.getInstance().CARD_DRAGGING);
                this.transientUiState.setDraggedCard(draggedCard);
            }
        } else {
            console.warn('Dragged object is not a PhysicalCard');
            this.transientUiState.setDraggedCard(null);
            this.originalCardPosition = null;
        }
    }

    private handleDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number): void {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) return;
        if (this.transientUiState.draggedCard) {
            this.transientUiState.draggedCard.container.x = dragX;
            this.transientUiState.draggedCard.container.y = dragY;

            this.checkCardUnderPointer(pointer);
        }
    }

    

    private handleDragEnd(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void {
        if (!UIContextManager.getInstance().isContext(UIContext.COMBAT)) {
            console.log('handleDragEnd: Not in combat context, returning');
            return;
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

    private resetDragState(): void {
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
            if (this.transientUiState.draggedCard) {
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
                // More comprehensive interactive setup
                card.container.setInteractive({
                    hitArea: card.cardBackground,
                    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                    useHandCursor: true
                });
                
                // Re-add event listeners
                card.container.off('pointerdown');
                card.container.on('pointerdown', () => this.handleCardClick(card));
            } else {
                card.container.removeInteractive();
            }
        });
    }
}

export default CombatInputHandler;
