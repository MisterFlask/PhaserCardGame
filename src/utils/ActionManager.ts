import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { GameState } from "../rules/GameState";
import { StoreCard } from '../screens/Campaign';
import { PhysicalCard } from '../ui/PhysicalCard';

export class ActionManager {
    private static instance: ActionManager;
    private actionQueue: ActionQueue;

    private constructor() { // Modified constructor
        this.actionQueue = new ActionQueue();
    }

    public static getInstance(): ActionManager { // Modified getInstance
        if (!ActionManager.instance) {
            ActionManager.instance = new ActionManager();
        }
        return ActionManager.instance;
    }

    public applyBuffToCharacter(character: BaseCharacter, buff: AbstractBuff): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            AbstractBuff._applyBuffToCharacter(character, buff);
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
            if (!canBePlayed){
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

        if (appliedViaPlayableCard){
            baseBlockValue = appliedViaPlayableCard.scaleBlock(baseBlockValue)
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
        const physicalCardOfTarget = target.physicalCard as PhysicalCard;
        if (!physicalCardOfTarget) {
            return;
        }

        fromAttack = fromAttack || true;

        const damageResult: DamageCalculationResult = CombatRules.calculateDamage({
            baseDamageAmount,
            target,
            sourceCharacter,
            sourceCard,
            fromAttack
        });

        if (fromAttack){
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
    }

    public purchaseShopItem(item: StoreCard): void {
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

    public modifyFire(amount: number, sourceCharacterIfAny?: BaseCharacter): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyFire(amount);
            return [];
        }));
    }
    public modifyIce(amount: number, sourceCharacterIfAny?: BaseCharacter): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyIce(amount);
            return [];
        }));
    }
    public modifyMind(amount: number, sourceCharacterIfAny? : BaseCharacter): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyMind(amount);
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
    public modifyMuscle(amount: number, sourceCharacterIfAny?: BaseCharacter): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyMuscle(amount);
            return [];
        }));
    }
}



    import Phaser from 'phaser';
import { AbstractCard } from '../gamecharacters/AbstractCard';
import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { CombatRules, DamageCalculationResult } from "../rules/CombatRules";
import { DamageInfo } from "../rules/DamageInfo";
import { DeckLogic, PileName } from "../rules/DeckLogic";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { IBaseCharacter } from "../gamecharacters/IBaseCharacter";

export abstract class GameAction {
    abstract playAction(): Promise<GameAction[]>;
}

export class ActionQueue {
    private queue: GameAction[] = [];
    private isResolving: boolean = false;

    addAction(action: GameAction): void {
        this.queue.push(action);
        if (!this.isResolving) {
            this.resolveActions();
        }
    }

    async resolveActions(): Promise<void> {
        if (this.isResolving) return;
        this.isResolving = true;

        while (this.queue.length > 0) {
            const currentAction = this.queue.shift();
            if (currentAction) {
                const newActions = await currentAction.playAction();
                this.queue.unshift(...newActions);
            }
            // Add a small delay to allow for animations and prevent blocking
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        this.isResolving = false;
    }
}


export class DealDamageAction extends GameAction {
    constructor(private amount: number,
        private target: BaseCharacter,
        private sourceCharacter?: BaseCharacter,
        private sourceCard?: AbstractCard) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        console.log(`Dealing ${this.amount} damage to ${this.target} from ${this.sourceCharacter?.name} with ${this.sourceCard?.name}`);
        // In a real game, you'd apply the damage to the target here
        // Simulate a delay for animation
        await new Promise(resolve => setTimeout(resolve, 500));
        return []; // Return any follow-up actions if needed
    }
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

