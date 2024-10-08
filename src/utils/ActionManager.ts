import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { GameState } from "../rules/GameState";
import { PhysicalCard } from '../ui/PhysicalCard';

export class ActionManager {
    exhaustCard(ownerCard: PlayableCard) {
        throw new Error("Method not implemented.");
    }
    exhaustRandomCardInHand() {
        throw new Error("Method not implemented.");
    }
    private static instance: ActionManager;
    private actionQueue: ActionQueue;
    private scene!: Scene;

    private constructor() { // Modified constructor
        this.actionQueue = new ActionQueue();
    }


    public static performAsyncronously(action: () => Promise<void>): void {
        const actionManager = ActionManager.getInstance();
        actionManager.actionQueue.addAction(new GenericAction(async () => {
            await action();
            return [];
        }));
    }

    public static init(scene: Scene) {
        if (!ActionManager.instance) {
            ActionManager.instance = new ActionManager();
        }
        this.getInstance().scene = scene;
    }

    public static getInstance(): ActionManager { // Modified getInstance
        if (!ActionManager.instance) {
            ActionManager.instance = new ActionManager();
        }
        return ActionManager.instance;
    }

    public tiltCharacter(character: BaseCharacter){
        this.animateAttackerTilt(character.physicalCard as PhysicalCard);
    }

    public applyBuffToCharacter(character: IBaseCharacter, buff: AbstractBuff, sourceCharacter?: IBaseCharacter): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            AbstractBuff._applyBuffToCharacter(character as BaseCharacter, buff);
            console.log(`Applied buff ${buff.getName()} to ${character.name}`);
            // You might want to add some animation or visual feedback here
            await new WaitAction(20).playAction(); // Short delay for visual feedback
            return [];
        }));
    }

    /**
     * wraps a thing in an action so it can be queued
     */
    public genericAction(name: string, action: () => Promise<void>): void {
        console.log("enqueued action: " + name);
        this.actionQueue.addAction(new GenericAction(async () => {
            console.log("beginning action: " + name);
            await action();
            console.log("ending action: " + name);
            return [];
        }));
    }

    public playCard(card: PhysicalCard, target?: BaseCharacter) {
        this.actionQueue.addAction(new GenericAction(async () => {
            const playableCard = card.data as PlayableCard;

            let canBePlayed = playableCard.IsPerformableOn(target);
            if (!canBePlayed) {
                return [];
            }

            if (target) {
                GameState.getInstance().combatState.energyAvailable -= playableCard.energyCost;
                playableCard.InvokeCardEffects(target);
            } else {
                playableCard.InvokeCardEffects();
            }

            DeckLogic.moveCardToPile(card.data, PileName.Discard);
            await this.animateDiscardCard(card);
            return [];
        }));
    }

    private animateDrawCard(card: AbstractCard): Promise<void> {
        return new Promise<void>((resolve) => {
            // Implement draw animation logic here
            console.log(`Animating draw for card: ${card.name}`);
            // Example animation delay
            setTimeout(() => resolve(), 20);
        });
    }

    private animateDiscardCard(card: PhysicalCard): Promise<void> {
        return new Promise<void>((resolve) => {
            // Implement discard animation logic here
            console.log(`Animating discard for card: ${card.data.name}`);
            // Example animation delay
            setTimeout(() => resolve(), 20);
        });
    }

    public discardCard = (card: AbstractCard): void => {
        this.actionQueue.addAction(new GenericAction(async () => {
            DeckLogic.moveCardToPile(card, PileName.Discard);
            await this.animateDiscardCard(card.physicalCard as PhysicalCard);
            await new WaitAction(20).playAction();
            return [];
        }));
    }

    public drawHandForNewTurn(): void {
        console.log('Drawing hand for new turn');
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;
        const handSize = 3; // Assuming a hand size of 3 cards

        this.drawCards(handSize);

        console.log('State of all piles:');
        console.log('Draw Pile:', combatState.currentDrawPile.map(card => card.name));
        console.log('Discard Pile:', combatState.currentDiscardPile.map(card => card.name));
        console.log('Hand:', combatState.currentHand.map(card => card.name));
    }

    public drawCards(count: number): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            const deckLogic = DeckLogic.getInstance();
            const drawnCards: AbstractCard[] = [];
            // Add a small delay after drawing each card
            for (let i = 0; i < count; i++) {
                const drawnCard = deckLogic.drawCards(1)[0];
                await this.animateDrawCard(drawnCard);
                await new WaitAction(50).playAction();
                drawnCards.push(drawnCard);
            }

            const gameState = GameState.getInstance();
            const combatState = gameState.combatState;


            console.log('Cards drawn:', drawnCards.map(card => card.name));
            console.log('Updated hand:', combatState.currentHand.map(card => card.name));

            return [];
        }));
    }


    public applyBlock(params: {
        baseBlockValue: number,
        appliedViaPlayableCard?: PlayableCard,
        blockSourceCharacter?: IBaseCharacter,
        blockTargetCharacter?: IBaseCharacter
    }): void {
        let { baseBlockValue, blockTargetCharacter, appliedViaPlayableCard, blockSourceCharacter } = params;
        console.log("Called ApplyBlock method in action manager. Block: " + baseBlockValue + " Target: " + blockTargetCharacter?.name);

        if (!blockTargetCharacter) {
            return;
        }

        this.actionQueue.addAction(new GenericAction(async () => {
            console.log("Applying block to " + blockTargetCharacter.name);
            // Get the physical card of the target character
            const targetPhysicalCard = (blockTargetCharacter as any).physicalCard as PhysicalCard;

            if (targetPhysicalCard && targetPhysicalCard.blockText) {
                // Pulse the block text box
                targetPhysicalCard.blockText.pulseGreenBriefly()
            }
            blockTargetCharacter.block += baseBlockValue;
            return [];
        }));
    }

    private animateCardDamage(physicalCardOfTarget: PhysicalCard): Promise<void> {
        return new Promise<void>((resolve) => {
            // Shake the card
            const originalX = physicalCardOfTarget.container.x;
            const shakeDistance = 5;
            const shakeDuration = 50;
            const shakeCount = 3;

            let currentShake = 0;
            const shakeInterval = setInterval(() => {
                if (currentShake >= shakeCount * 2) {
                    clearInterval(shakeInterval);
                    physicalCardOfTarget.container.x = originalX;
                } else {
                    physicalCardOfTarget.container.x += (currentShake % 2 === 0) ? shakeDistance : -shakeDistance;
                    currentShake++;
                }
            }, shakeDuration);
            // Flicker the card red
            let originalTint: number;
            if (physicalCardOfTarget.cardBackground instanceof Phaser.GameObjects.Image) {
                originalTint = physicalCardOfTarget.cardBackground.tint;
                physicalCardOfTarget.cardBackground.setTint(0xff0000);
            } else if (physicalCardOfTarget.cardBackground instanceof Phaser.GameObjects.Rectangle) {
                originalTint = physicalCardOfTarget.cardBackground.fillColor;
                physicalCardOfTarget.cardBackground.setFillStyle(0xff0000);
            }

            setTimeout(() => {
                if (physicalCardOfTarget.cardBackground instanceof Phaser.GameObjects.Image) {
                    physicalCardOfTarget.cardBackground.setTint(originalTint);
                } else if (physicalCardOfTarget.cardBackground instanceof Phaser.GameObjects.Rectangle) {
                    physicalCardOfTarget.cardBackground.setFillStyle(originalTint);
                }
                resolve();
            }, 300);

        });
    }

    public dealDamage = ({
        baseDamageAmount,
        target,
        sourceCharacter,
        sourceCard,
        fromAttack
    }: {
        baseDamageAmount: number,
        target: IBaseCharacter,
        sourceCharacter?: IBaseCharacter,
        sourceCard?: PlayableCard,
        fromAttack?: boolean
    }): void => {
        this.actionQueue.addAction(new GenericAction(async () => {
            const physicalCardOfTarget = target.physicalCard as PhysicalCard;
            if (!physicalCardOfTarget) {
                return [];
            }

            fromAttack = fromAttack || true;

            const damageResult: DamageCalculationResult = CombatRules.calculateDamage({
                baseDamageAmount,
                target,
                sourceCharacter,
                sourceCard,
                fromAttack
            });

            if (fromAttack) {
                // Activate OnStruck effects for the defender's buffs
                target.buffs.forEach(buff => {
                    const _buff = buff as AbstractBuff;
                    _buff.onOwnerStruck(sourceCharacter || null, sourceCard || null, {
                        damageDealt: damageResult.totalDamage,
                        damageTaken: damageResult.unblockedDamage,
                        damageBlocked: damageResult.blockedDamage
                    });
                });
            }

            if (damageResult.unblockedDamage > 0) {
                target.hitpoints = Math.max(0, target.hitpoints - damageResult.unblockedDamage);
            }

            console.log(`Damage Calculation: Total Damage: ${damageResult.totalDamage}, Blocked Damage: ${damageResult.blockedDamage}, Unblocked Damage: ${damageResult.unblockedDamage}`);

            // Handle death if hitpoints reach 0
            if (target.hitpoints <= 0) {
                CombatRules.handleDeath(target, sourceCharacter || null);
            }

            // {{ edit_2 }}
            // Animate the defender jiggle and glow based on unblocked damage
            if (damageResult.unblockedDamage > 0) {
                // Unblocked damage dealt: glow red
                this.animateDefenderJiggleAndGlow(physicalCardOfTarget, 0xff0000); // Red color
            } else {
                // No unblocked damage: glow white
                this.animateDefenderJiggleAndGlow(physicalCardOfTarget, 0xffffff); // White color
            }

            return [];
        }));
    }

    // {{ edit_3 }}
    /**
     * Animates the attacker tilting briefly to simulate an attack.
     * @param attacker The PhysicalCard of the attacker.
     */
    public animateAttackerTilt(attacker: PhysicalCard): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            // Tilt to the right

            this.scene.tweens.add({
                targets: attacker.container,
                angle: 15,
                duration: 100,
                yoyo: true,
                ease: 'Power1'
            });

            // Wait for the tilt animation to complete
            await new WaitAction(200).playAction();
            return [];
        }));
    }

    // {{ edit_4 }}
    /**
     * Animates the defender by jiggling and glowing with the specified color.
     * @param defender The PhysicalCard of the defender.
     * @param color The color to glow (e.g., red for damage dealt, white otherwise).
     */
    private animateDefenderJiggleAndGlow(defender: PhysicalCard, color: number): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            // Jiggle the defender
            this.scene.tweens.add({
                targets: defender.container,
                x: defender.container.x + 10,
                duration: 100,
                yoyo: true,
                repeat: 2,
                ease: 'Power1'
            });

            // Glow effect based on damage
            if (defender.cardBackground instanceof Phaser.GameObjects.Image) {
                this.scene.tweens.add({
                    targets: defender.cardBackground,
                    tint: color,
                    duration: 100,
                    yoyo: true,
                    ease: 'Power1'
                });
            } else if (defender.cardBackground instanceof Phaser.GameObjects.Rectangle) {
                this.scene.tweens.add({
                    targets: defender.cardBackground,
                    fillColor: color,
                    duration: 100,
                    yoyo: true,
                    ease: 'Power1'
                });
            }

            // Wait for the jiggling and glow animation to complete
            await new WaitAction(300).playAction();
            return [];
        }));
    }

    public purchaseShopItem(item: PlayableCard): void {
        item.OnPurchase();
        const inventory = GameState.getInstance().getInventory();
        inventory.push(item);
        GameState.getInstance().setShopItems(GameState.getInstance().getShopItems().filter(i => i !== item));
    }

    public async resolveActions(): Promise<void> {
        await this.actionQueue.resolveActions();
    }
    public discardCards(cards: AbstractCard[]): void {
        // Queue discarding multiple cards
        this.actionQueue.addAction(new GenericAction(async () => {
            cards.forEach(card => {
                this.discardCard(card);
            });
            return [];
        }));
    }

    public modifyFog(amount: number, sourceCharacterIfAny?: BaseCharacter): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyFog(amount);
            return [];
        }));
    }
    public modifyIce(amount: number, sourceCharacterIfAny?: BaseCharacter): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyIce(amount);
            return [];
        }));
    }
    public modifyPages(amount: number, sourceCharacterIfAny?: BaseCharacter): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyPages(amount);
            return [];
        }));
    }
    public modifyIron(amount: number, sourceCharacterIfAny?: BaseCharacter): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyIron(amount);
            return [];
        }));
    }
    public modifyGold(amount: number, sourceCharacterIfAny?: BaseCharacter): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyGold(amount);
            return [];
        }));
    }
    public modifyThunder(amount: number, sourceCharacterIfAny?: BaseCharacter): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyThunder(amount);
            return [];
        }));
    }

    public displaySubtitle(text: string): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            await CombatUIManager.getInstance().showSubtitle(text);
            // Small delay to ensure the subtitle appears before the next action
            await new WaitAction(50).playAction();
            return [];
        }));
    }

    public hideSubtitle(): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            await CombatUIManager.getInstance().hideSubtitle();
            return [];
        }));
    }

}

// {{ edit_1 }}
// Define ActionNode class outside of ActionManager to ensure proper scope
class ActionNode {
    constructor(public action: GameAction) { }
    public children: ActionNode[] = [];
}

export class ActionQueue {
    private queue: ActionNode[] = [];
    private currentActionNode: ActionNode | null = null;
    private isResolving: boolean = false;

    addAction(action: GameAction): void {
        if (this.currentActionNode) {
            this.currentActionNode.children.push(new ActionNode(action));
        } else {
            this.queue.push(new ActionNode(action));
        }
        if (!this.isResolving) {
            this.resolveActions();
        }
    }

    async resolveActions(): Promise<void> {
        if (this.isResolving) return;
        this.isResolving = true;

        while (this.queue.length > 0) {
            const currentNode = this.queue.pop();
            if (currentNode) {
                this.currentActionNode = currentNode;
                const newActions = await currentNode.action.playAction();
                for (const action of newActions) {
                    this.currentActionNode?.children.push(new ActionNode(action));
                }
                // Process child actions first (depth-first)
                while (currentNode.children.length > 0) {
                    const childNode = currentNode.children.pop();
                    if (childNode) {
                        this.queue.push(childNode);
                    }
                }
                // {{ edit_2 }}
                // Reset currentActionNode after processing its children
                this.currentActionNode = null;
            }
            // Add a small delay to allow for animations and prevent blocking
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        this.isResolving = false;
    }
}


import Phaser, { Scene } from 'phaser';
import { AbstractCard } from '../gamecharacters/AbstractCard';
import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { CombatRules, DamageCalculationResult } from "../rules/CombatRules";
import { DamageInfo } from "../rules/DamageInfo";
import { DeckLogic, PileName } from "../rules/DeckLogic";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { IBaseCharacter } from "../gamecharacters/IBaseCharacter";
import CombatUIManager from "../screens/subcomponents/CombatUiManager";

export abstract class GameAction {
    abstract playAction(): Promise<GameAction[]>;
}

export class GenericAction extends GameAction {
    constructor(private actionFunction: () => Promise<GameAction[]>) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        return await this.actionFunction();
    }
}

export class WaitAction extends GameAction {
    constructor(private milliseconds: number) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        await new Promise(resolve => setTimeout(resolve, this.milliseconds));
        return [];
    }
}

