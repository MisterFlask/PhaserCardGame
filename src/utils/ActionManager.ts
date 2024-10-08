import { GameState } from "../rules/GameState";

import Phaser, { Scene } from 'phaser';
import { IPhysicalCardInterface } from '../gamecharacters/AbstractCard';
import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { CombatRules, DamageCalculationResult } from "../rules/CombatRules";
import { DeckLogic, PileName } from "../rules/DeckLogic";
import { IBaseCharacter } from "../gamecharacters/IBaseCharacter";
import { AutomatedCharacterType, BaseCharacterType, PlayableCardType } from "../Types";
import { IAbstractCard } from "../gamecharacters/IAbstractCard";
import { SubtitleManager } from "../ui/SubtitleManager";
import CardSelectionFromHandManager from '../ui/CardSelectionFromHandManager';
import CombatUiManager from "../screens/subcomponents/CombatUiManager";

export class ActionManager {

    exhaustRandomCardInHand() {
        this.actionQueue.addAction(new GenericAction(async () => {
            const hand = GameState.getInstance().combatState.currentHand;
            if (hand.length > 0) {
                const randomIndex = Phaser.Math.Between(0, hand.length - 1);
                const randomCard = hand[randomIndex];
                ActionManager.getInstance().exhaustCard(randomCard as PlayableCardType);
            }
            return [];
        }));
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

    public tiltCharacter(character: BaseCharacterType){
        this.animateAttackerTilt(character.physicalCard!);
    }

    public applyBuffToCharacter(character: IBaseCharacter, buff: AbstractBuff, sourceCharacter?: IBaseCharacter): void {
        if (character == null || buff == null) {
            return;
        }
        this.actionQueue.addAction(new GenericAction(async () => {
            AbstractBuff._applyBuffToCharacter(character as BaseCharacterType, buff);
            console.log(`Applied buff ${buff.getName()} to ${character.name}`);
            // You might want to add some animation or visual feedback here
            await new WaitAction(20).playAction(); // Short delay for visual feedback
            return [];
        }));
    }

    public removeBuffFromCharacter(character: IBaseCharacter, buffName: string, stacksToRemove?: number): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            const buff = character.buffs.find(b => b.getName() === buffName);
            if (buff) {
                if (!stacksToRemove){
                    buff.stacks = 0
                }
                else{
                    buff.stacks -= stacksToRemove;
                }
            }
            
            console.log(`Removed buff ${buffName} from ${character.name}`);
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

    public playCard(card: IPhysicalCardInterface, target?: BaseCharacterType) {
        this.actionQueue.addAction(new GenericAction(async () => {
            const playableCard = card.data as PlayableCardType;

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

    public stateBasedEffects(){
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        combatState.allPlayerAndEnemyCharacters.forEach(character => {
            character.buffs.slice().forEach(buff => { // Create a copy of buffs
                if (buff.stacks <= 0) {
                    character.buffs = character.buffs.filter(existingBuff => existingBuff !== buff);
                }
            });
        });
    }

    private animateDrawCard(card: IAbstractCard): Promise<void> {
        return new Promise<void>((resolve) => {
            // Implement draw animation logic here
            console.log(`Animating draw for card: ${card.name}`);
            // Example animation delay
            setTimeout(() => resolve(), 20);
        });
    }

    private animateDiscardCard(card: IPhysicalCardInterface): Promise<void> {
        return new Promise<void>((resolve) => {
            // Implement discard animation logic here
            console.log(`Animating discard for card: ${card.data.name}`);
            // Example animation delay
            setTimeout(() => resolve(), 20);
        });
    }

    public basicDiscardCard = (card: IAbstractCard): void => {
        this.actionQueue.addAction(new GenericAction(async () => {
            DeckLogic.moveCardToPile(card, PileName.Discard);
            await this.animateDiscardCard(card.physicalCard!);
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
            const drawnCards: IAbstractCard[] = [];
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
        appliedViaPlayableCard?: PlayableCardType,
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
            const targetPhysicalCard = (blockTargetCharacter as any).physicalCard as IPhysicalCardInterface;

            if (targetPhysicalCard && targetPhysicalCard.blockText) {
                // Pulse the block text box
                targetPhysicalCard.blockText.pulseGreenBriefly()
            }
            blockTargetCharacter.block += baseBlockValue;
            return [];
        }));
    }

    private animateCardDamage(physicalCardOfTarget: IPhysicalCardInterface): Promise<void> {
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
        sourceCard?: PlayableCardType,
        fromAttack?: boolean
    }): void => {
        this.actionQueue.addAction(new GenericAction(async () => {
            const physicalCardOfTarget = target.physicalCard;
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

            if (damageResult.unblockedDamage > 0) {
                target.hitpoints = Math.max(0, target.hitpoints - damageResult.unblockedDamage);
            }
            if (damageResult.blockedDamage > 0) {
                target.block = Math.max(0, target.block - damageResult.blockedDamage);
            }

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

                // now for every buff on the source character, invoke its onOwnerStriking method
                sourceCharacter?.buffs.forEach(buff => {
                    buff.onOwnerStriking(target as BaseCharacterType, sourceCard || null, {
                        damageDealt: damageResult.totalDamage,
                        damageTaken: damageResult.unblockedDamage,
                        damageBlocked: damageResult.blockedDamage
                    });
                });
            }

            console.log(`Damage Calculation: Total Damage: ${damageResult.totalDamage}, Blocked Damage: ${damageResult.blockedDamage}, Unblocked Damage: ${damageResult.unblockedDamage}`);

            // Handle death if hitpoints reach 0
            if (target.hitpoints <= 0) {
                // Activate onFatal effects for the defender's buffs
                sourceCharacter?.buffs.forEach(buff => {
                    buff.onFatal(target as BaseCharacterType)
                });

                // now we do the same operation on the attacker's card that killed it
                sourceCard?.buffs.forEach(buff => {
                    buff.onFatal(target as BaseCharacterType)
                });

                CombatRules.handleDeath(target, sourceCharacter || null);
            }

            // Display the damage number
            this.displayDamageNumber({
                target,
                damageAmount: damageResult.totalDamage,
                isBlocked: damageResult.unblockedDamage === 0
            });

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
    public animateAttackerTilt(attacker: IPhysicalCardInterface): void {
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
    private animateDefenderJiggleAndGlow(defender: IPhysicalCardInterface, color: number): void {
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

            var bg = defender.cardBackground;
            // Glow effect based on damage
            if (bg instanceof Phaser.GameObjects.Image) {
                this.scene.tweens.add({
                    targets: defender.cardBackground,
                    tint: color,
                    duration: 100,
                    yoyo: true,
                    ease: 'Power1'
                });
            } else if (bg instanceof Phaser.GameObjects.Rectangle) {
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

    public purchaseShopItem(item: PlayableCardType): void {
        item.OnPurchase();
        const inventory = GameState.getInstance().getInventory();
        inventory.push(item);
        GameState.getInstance().setShopItems(GameState.getInstance().getShopItems().filter(i => i !== item));
    }

    public async resolveActions(): Promise<void> {
        await this.actionQueue.resolveActions();
    }
    public basicDiscardCards(cards: IAbstractCard[]): void {
        // Queue discarding multiple cards
        this.actionQueue.addAction(new GenericAction(async () => {
            cards.forEach(card => {
                this.basicDiscardCard(card);
            });
            return [];
        }));
    }

    public modifyFog(amount: number, sourceCharacterIfAny?: BaseCharacterType): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyFog(amount);
            return [];
        }));
    }
    public modifyIce(amount: number, sourceCharacterIfAny?: BaseCharacterType): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyIce(amount);
            return [];
        }));
    }
    public modifyPages(amount: number, sourceCharacterIfAny?: BaseCharacterType): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyPages(amount);
            return [];
        }));
    }
    public modifyIron(amount: number, sourceCharacterIfAny?: BaseCharacterType): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyIron(amount);
            return [];
        }));
    }
    public modifyGold(amount: number, sourceCharacterIfAny?: BaseCharacterType): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyVenture(amount);
            return [];
        }));
    }
    public modifyThunder(amount: number, sourceCharacterIfAny?: BaseCharacterType): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyPowder(amount);
            return [];
        }));
    }

    public displaySubtitle(text: string): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            await SubtitleManager.getInstance().showSubtitle(text);
            // Small delay to ensure the subtitle appears before the next action
            await new WaitAction(50).playAction();
            return [];
        }));
    }
    public static PlayCard = (card: PlayableCardType, target: BaseCharacterType): void => {
        // Invoke the effect of the card
        if (card.IsPerformableOn(target)) {
            card.InvokeCardEffects(target);
            
            // now for each buff on the card, invoke its onCardInvoked effect
            card.buffs.forEach(buff => {
                buff.onCardInvoked(target);
            });
        }

        // Queue discard action instead of direct discard
        ActionManager.getInstance().basicDiscardCard(card);
    };

    public static endTurn(): void {
        console.log('Ending turn');
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // {{ edit_1 }}
        // Remove intents from dead enemies
        combatState.enemies.forEach(enemy => {
            if (enemy.hitpoints <= 0) {
                enemy.intents = [];
            }
        });

        combatState.enemies.forEach(enemy => {
            for (const intent of [...enemy.intents]) {
                // Display the intent's title or tooltip text
                ActionManager.getInstance().displaySubtitle(intent.title || intent.tooltipText());

                
                // Queue the intent's action
                intent.act();

                // Hide the subtitle after the action completes
                ActionManager.getInstance().hideSubtitle();

                // Set new intents for the enemy
                ActionManager.performAsyncronously(async () => {
                    await enemy.removeIntent(intent);
                });
            }
        });

        // end turn buffs
        combatState.allPlayerAndEnemyCharacters.forEach(character => {
            character.buffs.forEach(buff => {
                buff.onTurnEnd();
            });
        });

        
        // Queue discard actions instead of direct discard
        ActionManager.getInstance().basicDiscardCards(combatState.currentHand);
        ActionManager.beginTurn();
    }


    public activeDiscardCard(card: PlayableCardType): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            this.basicDiscardCard(card);
            for (const buff of card.buffs) {
                buff.onDiscard();
            }
            return [];
        }));
    }

    public exhaustCard(card: PlayableCardType): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            DeckLogic.moveCardToPile(card, PileName.Exhaust);
            console.log(`Exhausted card ${card.name}`);
            await new WaitAction(20).playAction(); // Short delay for visual feedback
            for (const buff of card.buffs) {
                buff.onExhaust();
            }
            return [];
        }));
    }

    public static beginTurn(): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Prevent dead enemies from gaining new intents
        combatState.enemies.forEach(enemy => {
            if (enemy.hitpoints > 0) {
                enemy.setNewIntents();
            }
        });

        // Queue draw action instead of direct draw
        ActionManager.getInstance().drawHandForNewTurn();

        combatState.allPlayerAndEnemyCharacters.forEach(character => {
            character.buffs.forEach(buff => {
                buff.onTurnStart();
            });
        });

        combatState.energyAvailable = combatState.maxEnergy
    }

    public static ExecuteIntents(): void {
        const gameState = GameState.getInstance();
        const allCards = [...gameState.combatState.playerCharacters, ...gameState.combatState.enemies];

        allCards.forEach(card => {
            if (card.isAutomatedCharacter()) {
                var autoChar = card as AutomatedCharacterType;
                const intents = autoChar.intents;
                intents.forEach(intent => {
                    intent.act();
                });
            }
        });
    }


    public hideSubtitle(): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            await SubtitleManager.getInstance().hideSubtitle();
            return [];
        }));
    }
    public requireCardSelection(params: {
        name: string;
        instructions: string;
        min: number;
        max: number;
        cancellable: boolean;
        action: (selectedCards: PlayableCardType[]) => void;
    }): void {
        const combatUiManager = CombatUiManager.getInstance();
        const scene = combatUiManager.scene; // Assuming CombatUiManager can provide the current scene


        // if the min number of cards is greater than the current hand size, just perform the action on the set of cards that are in the player's hand.
        if (params.min > GameState.getInstance().combatState.currentHand.length) {
            params.action(GameState.getInstance().combatState.currentHand as PlayableCardType[]);
            return;
        }

        const selectionManager = new CardSelectionFromHandManager({
            scene: scene,
            action: params.action,
            name: params.name,
            instructions: params.instructions,
            min: params.min,
            max: params.max,
            cancellable: params.cancellable
        });

        selectionManager.start();
    }

    private displayDamageNumber(params: {
        target: IBaseCharacter,
        damageAmount: number,
        isBlocked: boolean
    }): void {
        const { target, damageAmount, isBlocked } = params;
        const color = isBlocked ? "#0000ff" : "#ff0000"; // Blue for blocked, red for real damage

        if (target.physicalCard == null) {
            return;
        }

        console.log(`Displaying damage number: ${damageAmount} for ${target.name}`);
        this.actionQueue.addAction(new GenericAction(async () => {
            const scene = this.scene;
            const text = scene.add.text(
                target.physicalCard!.container.x, 
                target.physicalCard!.container.y - 50, // Position above the card
                damageAmount.toString(), 
                {
                    font: 'bold 32px Arial',
                    color: '#ffffff',
                    stroke: color,//'#000000',
                    strokeThickness: 2
                }
            );
            text.setDepth(2000);

            scene.tweens.add({
                targets: text,
                y: text.y - 50, // Drift upwards
                alpha: 0, // Fade out
                duration: 3000, // 1 second
                ease: 'Power1',
                onComplete: () => text.destroy()
            });

            await new WaitAction(1).playAction(); // Not really waiting.
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

        ActionManager.getInstance().stateBasedEffects();
        this.isResolving = false;
    }
}

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