import { GameState, CombatState, CombatResources } from "../rules/GameState";
import { ActionManager } from "../utils/ActionManager";
import { AbstractCard, TargetingType, Team } from "./AbstractCard";
import { BaseCharacter } from "./BaseCharacter";
import { CardType, CardSize } from "./Primitives";

export abstract class PlayableCard extends AbstractCard {
    targetingType: TargetingType
    constructor({ name, description, portraitName, cardType, tooltip, characterData, size, targetingType, owner }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string, characterData?: AbstractCard, size?: CardSize, targetingType?: TargetingType, owner?: BaseCharacter }) {
        super({ name, description, portraitName, cardType, tooltip, characterData, size });
        this.targetingType = targetingType || TargetingType.ENEMY;
        this.owner = owner;
    }

    public scaleBlock(inputBlock: number): number{
        return inputBlock;
    }
    
    public scaleDamage(inputBlock: number): number{
        return inputBlock;
    }

    public scaleMagicNumber(inputBlock: number): number{
        return inputBlock;
    }

    public baseDamage: number = 0
    public baseBlock: number = 0
    public magicNumber: number = 0

    get hoveredCharacter(): BaseCharacter | undefined {
        return GameState.getInstance().combatState.characterHoveredOver_transient;
    }
    get combatState() : CombatState{
        return GameState.getInstance().combatState;
    }
    get actionManager() : ActionManager{
        return ActionManager.getInstance();
    }

    get fire(): number {
        return this.combatResources.fire.value;
    }

    get ice(): number {
        return this.combatResources.ice.value;
    }

    get mind(): number {
        return this.combatResources.mind.value;
    }

    get iron(): number {
        return this.combatResources.iron.value;
    }

    get gold(): number {
        return this.combatResources.gold.value;
    }

    get muscle(): number {
        return this.combatResources.muscle.value;
    }

    get light(): number {
        return this.combatResources.light.value;
    }

    protected dealDamageToTarget(targetCard?: BaseCharacter): void {
        if (targetCard) {
            this.actionManager.dealDamage({
                baseDamageAmount: this.baseDamage,
                target: targetCard,
                sourceCharacter: this.owner,
                fromAttack: true,
                sourceCard: this
            });
            console.log(`Dealt ${this.getDisplayedDamage(targetCard)} damage to ${targetCard.name}`);
        }
    }

    protected applyBlockToTarget(targetCard?: BaseCharacter): void {
        if (targetCard) {
            this.actionManager.applyBlock({
                blockTargetCharacter: targetCard,
                baseBlockValue: this.baseBlock,
                appliedViaPlayableCard: this,
                blockSourceCharacter: this.owner
            });
        }
    }

    get combatResources() : CombatResources{
        return GameState.getInstance().combatState.combatResources;
    }
    
    get randomEnemy() : BaseCharacter | undefined {
        const livingEnemies = this.combatState.enemies.filter(enemy => enemy.hitpoints > 0);
        
        if (livingEnemies.length === 0) {
            return undefined;
        }

        return livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
    }


    public getDisplayedBlock(targetedCharacterIfAny?: BaseCharacter){
        if (!this.owner) {
            return this.baseBlock;
        }

        let totalBlock = this.scaleBlock(this.baseBlock);

        for (const buff of this.owner.buffs) {
            totalBlock += buff.getBlockSentModifier();
        }

        // Apply block received modifiers from the targeted character
        if (targetedCharacterIfAny) {
            for (const buff of targetedCharacterIfAny.buffs) {
                totalBlock = buff.getBlockReceivedModifier();
            }
        }

        return totalBlock;
    }

    public getDisplayedDamage(targetedCharacterIfAny: BaseCharacter | undefined){
        if (!this.owner) {
            return this.baseDamage;
        }

        let totalDamage = this.scaleDamage(this.baseDamage);

        for (const buff of this.owner.buffs) {
            totalDamage += buff.getCombatDamageDealtModifier();
        }

        // Apply block received modifiers from the targeted character
        if (targetedCharacterIfAny) {
            for (const buff of targetedCharacterIfAny.buffs) {
                totalDamage = buff.getCombatDamageTakenModifier();
            }
        }

        return totalDamage;
    }

    public getDisplayedMagicNumber(targetedCharacterIfAny: BaseCharacter | undefined){
        return this.scaleMagicNumber(this.magicNumber)
    }

    abstract InvokeCardEffects(targetCard?: AbstractCard): void;

    public IsPerformableOn(targetCard?: AbstractCard): boolean{
        return true;
    }

    public IsPerformableOn_Outer(targetCard?: AbstractCard): boolean {

        if (this.targetingType === TargetingType.NO_TARGETING) {
            return true;
        }

        if (!(targetCard instanceof BaseCharacter)) {
            return false;
        }

        const isTargetAlly = targetCard instanceof BaseCharacter && targetCard.team === Team.ALLY;
        const isTargetEnemy = targetCard instanceof BaseCharacter && targetCard.team === Team.ENEMY;
        let appropriateTargeting = false;
        let inappropriateTargetingReason = "";
        switch (this.targetingType) {
            case TargetingType.ALLY:
                appropriateTargeting = isTargetAlly && this.IsPerformableOn(targetCard);
                if (!appropriateTargeting) {
                    inappropriateTargetingReason = "Target is not an ally";
                }
            case TargetingType.ENEMY:
                appropriateTargeting = isTargetEnemy && this.IsPerformableOn(targetCard);
                if (!appropriateTargeting) {
                    inappropriateTargetingReason = "Target is not an enemy";
                }
            default:
                console.warn(`Unknown targeting type: ${this.targetingType}`);
                appropriateTargeting = false;
        }
        if (!appropriateTargeting) {
            console.log("Inappropriate targeting for card: " + this.name + ". Reason: " + inappropriateTargetingReason);
            return false;
        }

        if (GameState.getInstance().combatState.energyAvailable > this.energyCost) {
            return false;
        }
        
        return true;
    }
}