import { IBaseCharacter } from "../gamecharacters/IBaseCharacter";
import { GameState } from "./GameState";


import { AutomatedCharacterType, BaseCharacterType, PlayableCardType } from "../Types";

export class DamageCalculationResult {
    totalDamage: number;
    blockedDamage: number;
    unblockedDamage: number;

    constructor(totalDamage: number, blockedDamage: number, unblockedDamage: number) {
        this.totalDamage = Math.round(totalDamage);
        this.blockedDamage = Math.round(blockedDamage);
        this.unblockedDamage = Math.round(unblockedDamage);
    }
}

export class CombatRules {

    public static calculateBlockSentToCharacterByCard(card: PlayableCardType, sourceCharacter: IBaseCharacter, targetCharacter: IBaseCharacter): number{
        let totalBlock = card.getBaseBlockAfterResourceScaling();

        if (sourceCharacter) {
            for (const buff of sourceCharacter.buffs) {
                totalBlock += buff.getBlockSentModifier(targetCharacter as BaseCharacterType);
            }
        }

        if (targetCharacter) {
            for (const buff of targetCharacter.buffs) {
                totalBlock += buff.getBlockReceivedModifier();
            }
        }

        return totalBlock;
    }

    public static handleDeath(character: IBaseCharacter, killer: IBaseCharacter | null): void {
        if (character.isAutomatedCharacter()){
            (character as AutomatedCharacterType).intents = [];
        }
        character.buffs = [];

        // Remove all cards belonging to the dead character from hand, discard, and draw piles
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        const removeDeadCharacterCards = (pile: PlayableCardType[]) => {
            return pile.filter(card => card.owningCharacter !== character);
        };

        combatState.currentHand = removeDeadCharacterCards(combatState.currentHand );
        combatState.currentDiscardPile = removeDeadCharacterCards(combatState.currentDiscardPile );
        combatState.drawPile = removeDeadCharacterCards(combatState.drawPile );
    }

    public static handleStateBasedEffects(){
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Check if all enemies are defeated
        const allEnemiesDefeated = combatState.enemies.every(enemy => enemy.hitpoints <= 0);

        if (allEnemiesDefeated) {
            //todo
        }
    }


    /**
     * The only time target is null is when we're calculating the damage of something hypothetically.
     * Base damage is AFTER resource-based scaling.
     */
    public static calculateDamage = ({
        baseDamageAmount,
        target,
        sourceCharacter,
        sourceCard,
        fromAttack = true,
        ignoresBlock = false
    }: {
        baseDamageAmount: number,
        target?: IBaseCharacter,
        sourceCharacter?: IBaseCharacter,
        sourceCard?: PlayableCardType,
        fromAttack?: boolean,
        ignoresBlock?: boolean
    }): DamageCalculationResult => {
        let totalDamage = baseDamageAmount;
        
        sourceCharacter?.buffs.forEach(buff => {
            totalDamage += buff.getCombatDamageDealtModifier(target as BaseCharacterType, sourceCard);
            totalDamage *= (1 + buff.getAdditionalPercentCombatDamageDealtModifier() / 100);
        });
        // Apply target character buffs
        target?.buffs.forEach(buff => {
            totalDamage += buff.getCombatDamageTakenModifier();
            totalDamage *= (1 + buff.getAdditionalPercentCombatDamageTakenModifier() / 100);
        });

        //apply playable card buffs
        sourceCard?.buffs.forEach(buff => {
            totalDamage += buff.getCombatDamageDealtModifier(target as BaseCharacterType, sourceCard);
            totalDamage *= (1 + buff.getAdditionalPercentCombatDamageDealtModifier() / 100);
        });

        // Process buffs on target for damageCappedAt
        if (target) {
            const damageCap = target.buffs.reduce((cap, buff) => {
                const buffCap = buff.getDamagePerHitCappedAt();
                return Math.min(cap, buffCap);
            }, Infinity);

            totalDamage = Math.min(totalDamage, damageCap);
        }

        // Ensure damage doesn't go below 0
        totalDamage = Math.max(0, totalDamage);

        let blockedDamage = ignoresBlock ? 0 : Math.min(target?.block || 0, totalDamage);
        let unblockedDamage = totalDamage - blockedDamage;

        return new DamageCalculationResult(totalDamage, blockedDamage, unblockedDamage);
    };
}