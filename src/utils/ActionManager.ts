import { GameState } from "../rules/GameState";

import Phaser, { Scene } from 'phaser';
import { AbstractCard, IPhysicalCardInterface } from '../gamecharacters/AbstractCard';
import type { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { Stress } from "../gamecharacters/buffs/standard/Stress";
import { IBaseCharacter } from "../gamecharacters/IBaseCharacter";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { ProcBroadcaster } from "../gamecharacters/procs/ProcBroadcaster";
import { AbstractRelic } from "../relics/AbstractRelic";
import { AbstractCombatEvent } from "../rules/AbstractCombatEvent";
import { CombatRules, DamageCalculationResult } from "../rules/CombatRules";
import { DeckLogic, PileName } from "../rules/DeckLogic";
import CombatUiManager from "../screens/subcomponents/CombatUiManager";
import { AutomatedCharacterType, BaseCharacterType, PlayableCardType } from "../Types";
import CardSelectionFromHandManager from '../ui/CardSelectionFromHandManager';
import { SubtitleManager } from "../ui/SubtitleManager";

export class ActionManager {


    sellItemForHellCurrency(item: PlayableCard) {
        const inventory = GameState.getInstance().cardsInventory;
        const index = inventory.findIndex(card => card.id === item.id);
        if (index !== -1) {
            inventory.splice(index, 1);
        }

        GameState.getInstance().hellCurrency += item.hellSellValue;
    }
    buyRelicForHellCurrency(relic: AbstractRelic, price: number) : boolean {
        if (GameState.getInstance().hellCurrency < price) {
            return false;
        }
        const inventory = GameState.getInstance().relicsInventory;
        inventory.push(relic);
        
        GameState.getInstance().hellCurrency -= price;
        return true;
    }


    buyItemForHellCurrency(item: PlayableCard) : boolean {
        const inventory = GameState.getInstance().cardsInventory;
        if (GameState.getInstance().hellCurrency < item.hellPurchaseValue) {
            return false;
        }
        
        inventory.push(item);
        GameState.getInstance().hellCurrency -= item.hellPurchaseValue;
        return true;
    }


    heal(character: BaseCharacter, amount: number) {
        this.actionQueue.addAction(new GenericAction(async () => {
            character.hitpoints += amount;
            if (character.hitpoints > character.maxHitpoints) {
                character.hitpoints = character.maxHitpoints;
            }

            return [];
        }));
    }
    public createCardToDrawPile(card: PlayableCard) {
        this.actionQueue.addAction(new GenericAction(async () => {
            const gameState = GameState.getInstance();
            gameState.combatState.currentDrawPile.push(card);
            return [];
        }));
    }

    public createCardToHand(card: PlayableCard) {
        this.actionQueue.addAction(new GenericAction(async () => {
            const gameState = GameState.getInstance();
            gameState.combatState.currentHand.push(card);
            return [];
        }));
    }

    public moveCardToPile(card: PlayableCard, pileName: PileName) {
        this.actionQueue.addAction(new GenericAction(async () => {
            DeckLogic.moveCardToPile(card, pileName);
            return [];
        }));
    }

    public createCardToDiscardPile(card: PlayableCard) {
        this.actionQueue.addAction(new GenericAction(async () => {
            const gameState = GameState.getInstance();
            gameState.combatState.currentDiscardPile.push(card);
            return [];
        }));
    }
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


    public performAsyncronously(action: () => Promise<void>): void {
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

    public applyBuffToCard(card: PlayableCard, buff: AbstractBuff) {
        this.actionQueue.addAction(new GenericAction(async () => {
            card.buffs.push(buff);
            console.log(`Applied buff ${buff.getName()} to card ${card.name}`);
            return [];
        }));
    }

    public applyBuffToCharacter(character: BaseCharacter, buff: AbstractBuff, sourceCharacter?: IBaseCharacter): void {
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

            // Handle missing energy using buffs
            const gameState = GameState.getInstance();
            const combatState = gameState.combatState;
            let missingEnergy = playableCard.energyCost - combatState.energyAvailable;

            let missingEnergyBuffs: AbstractBuff[] = []; // Iterate over all card buffs to handle missing energy
            for (const buff of card.data.buffs) { 

                if (missingEnergy <= 0) {
                    break;
                }

                const maxProvidedIfWePayAltCost = buff.canPayThisMuchMissingEnergy(missingEnergy);

                if (maxProvidedIfWePayAltCost <= 0){
                    continue;
                }

                const energyToCover = Math.min(missingEnergy, maxProvidedIfWePayAltCost);
                if (maxProvidedIfWePayAltCost > 0){
                    console.log("can pay " + energyToCover + " from " + buff.getName());
                    missingEnergy -= energyToCover;
                    missingEnergyBuffs.push(buff);
                }

            }

            // After processing all buffs, check if missing energy is still greater than 0
            if (missingEnergy > 0) {
                // Not all missing energy could be covered
                this.displaySubtitle("Not enough energy to play this card.");
                return [];
            }

            if (target) {
                combatState.energyAvailable -= playableCard.energyCost;
                playableCard.InvokeCardEffects(target);
            } else {
                playableCard.InvokeCardEffects();
            }

            // now we pay the missing energy
            missingEnergyBuffs.forEach(buff => {
                console.log("paying missing energy for " + buff.getName());
                buff.provideMissingEnergy_returnsAmountProvided(missingEnergy);
            });

            DeckLogic.moveCardToPile(card.data as PlayableCard, PileName.Discard);
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



        // Consolidate stacks of buffs of the same type
        combatState.allPlayerAndEnemyCharacters.forEach(character => {
            // Create a map to track buffs by their constructor name
            const buffsByType = new Map<string, AbstractBuff[]>();
            
            character.buffs.forEach(buff => {
                const buffType = buff.constructor.name;
                if (!buffsByType.has(buffType)) {
                    buffsByType.set(buffType, []);
                }
                buffsByType.get(buffType)!.push(buff);
            });

            // For each buff type that has multiple instances
            buffsByType.forEach((buffs, buffType) => {
                if (buffs.length > 1) {
                    // Sum up all stacks
                    const totalStacks = buffs.reduce((sum, buff) => sum + buff.stacks, 0);
                    
                    // Keep the first buff and update its stacks
                    const firstBuff = buffs[0];
                    firstBuff.stacks = totalStacks;

                    // Remove other buffs of the same type
                    character.buffs = character.buffs.filter(buff => 
                        buff === firstBuff || buff.constructor.name !== buffType
                    );
                }
            });
        });
    }

    private animateDrawCard(card: PlayableCard): Promise<void> {
        return new Promise<void>((resolve) => {
            // Implement draw animation logic here
            console.log(`Animating draw for card: ${card.name}`);
            // Example animation delay
            setTimeout(() => resolve(), 20);
        });
    }

    private animateDiscardCard(card: IPhysicalCardInterface): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!card?.data){
                console.info("No physical card found for " + card);
                resolve();
                return;
            }
            // Implement discard animation logic here
            console.log(`Animating discard for card: ${card.data.name}`);
            // Example animation delay
            setTimeout(() => resolve(), 20);
        });
    }

    public basicDiscardCard = (card: PlayableCard): void => {
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

    public drawCards(count: number, callback?: (cards: PlayableCard[]) => void): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            const deckLogic = DeckLogic.getInstance();
            const drawnCards: PlayableCard[] = [];
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

            callback?.(drawnCards);

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
        fromAttack,
        callback
    }: {
        baseDamageAmount: number,
        target: IBaseCharacter,
        sourceCharacter?: IBaseCharacter,
        sourceCard?: PlayableCardType,
        fromAttack?: boolean,
        callback?: (damageResult: DamageCalculationResult) => void
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
                    _buff.onOwnerStruck_CannotModifyDamage(sourceCharacter || null, sourceCard || null, {
                        damageDealt: damageResult.totalDamage,
                        unblockedDamageTaken: damageResult.unblockedDamage,
                        damageBlocked: damageResult.blockedDamage
                    });
                });

                // now for every buff on the source character, invoke its onOwnerStriking method
                sourceCharacter?.buffs.forEach(buff => {
                    buff.onOwnerStriking(target as BaseCharacterType, sourceCard || null, {
                        damageDealt: damageResult.totalDamage,
                        unblockedDamageTaken: damageResult.unblockedDamage,
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

            callback?.(damageResult);

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
    public basicDiscardCards(cards: AbstractCard[]): void {
        // Queue discarding multiple cards
        this.actionQueue.addAction(new GenericAction(async () => {
            cards.forEach(card => {
                this.basicDiscardCard(card as PlayableCard);
            });
            return [];
        }));
    }

    public modifyFog(amount: number, sourceCharacterIfAny?: BaseCharacterType): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifySmog(amount);
            return [];
        }));
    }
    public modifyPluck(amount: number, sourceCharacterIfAny?: BaseCharacterType): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyPluck(amount);
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
    public modifyPowder(amount: number, sourceCharacterIfAny?: BaseCharacterType): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            GameState.getInstance().combatState.combatResources.modifyPowder(amount);
            return [];
        }));
    }

    public displaySubtitle(text: string, durationMs: number = 4000): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            await SubtitleManager.getInstance().showSubtitle(text);
            // Wait for the specified duration
            await new WaitAction(durationMs).playAction();
            await SubtitleManager.getInstance().hideSubtitle();
            return [];
        }));
    }

    public PlayCard = (card: PlayableCardType, target: BaseCharacterType): void => {
        // Invoke the effect of the card
        if (card.IsPerformableOn(target)) {
            card.InvokeCardEffects(target);
            
            // now for each buff on the card, invoke its onCardInvoked effect
            card.buffs.forEach(buff => {
                buff.onThisCardInvoked(target);
            });
        }

        // Queue discard action instead of direct discard
        ActionManager.getInstance().basicDiscardCard(card);
    };

    public endTurn(): void {
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
                this.displaySubtitle(intent.title || intent.tooltipText());

                
                // Queue the intent's action
                intent.act();

                // Hide the subtitle after the action completes
                this.hideSubtitle();

                // Set new intents for the enemy
                this.performAsyncronously(async () => {
                    await enemy.removeIntent(intent);
                });
            }
        });

        // end turn buffs
        combatState.allPlayerAndEnemyCharacters.forEach(character => {
            character.buffs.forEach(buff => {
                buff.onTurnEnd_CharacterBuff();
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
                buff.onActiveDiscard();
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

            ProcBroadcaster.getInstance().broadcastCombatEvent(new ExhaustEvent(card));

            return [];
        }));
    }

    public addStressToCharacter(character: BaseCharacter, amount: number): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            const stressBuff = new Stress(amount);
            this.applyBuffToCharacter(character, stressBuff);
            console.log(`Added ${amount} Stress to ${character.name}`);
            return [];
        }));
    }

    public relieveStressFromCharacter(character: BaseCharacter, amount: number): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            const reliefBuff = new Stress(amount);
            this.removeBuffFromCharacter(character, reliefBuff.getName(), amount);
            console.log(`Relieved ${amount} Stress from ${character.name}`);
            return [];
        }));
    }

    public DoAThing(debugName: string, action: () => void): void {
        console.log(`Doing a thing: ${debugName}`);
        this.actionQueue.addAction(new GenericAction(async () => {
            action();
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

public chooseCardToDiscard(): void {
    this.requireCardSelection({
        name: "Discard",
        instructions: "Choose a card to discard",
        min: 1,
        max: 1,
        cancellable: false,
        action: (selectedCards: PlayableCardType[]) => {
            if (selectedCards.length > 0) {
                this.basicDiscardCard(selectedCards[0]);
            }
        }
    });
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

export class ExhaustEvent extends AbstractCombatEvent {
    printJson(): void {
        console.log(`{"event": "ExhaustEvent", "card": "${this.card.name}"}`);
    }
    constructor(public card: PlayableCard) {
        super();
    }
}
