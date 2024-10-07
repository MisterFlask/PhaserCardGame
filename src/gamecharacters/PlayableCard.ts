import { GameState, CombatState, CombatResources, CombatResource } from "../rules/GameState";
import { ActionManager } from "../utils/ActionManager";
import { AbstractCard, TargetingType, Team } from "./AbstractCard";
import { BaseCharacter } from "./BaseCharacter";
import { CardType, CardSize } from "./Primitives";
import { IBaseCharacter } from "./IBaseCharacter";
import { CombatRules } from "../rules/CombatRules";
import { AbstractBuff } from "./buffs/AbstractBuff";
export abstract class PlayableCard extends AbstractCard {
    targetingType: TargetingType

    resourceScalings: CardResourceScaling[] = []
    constructor({ name, description, portraitName, cardType, tooltip, characterData, size, targetingType, owner }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string, characterData?: AbstractCard, size?: CardSize, targetingType?: TargetingType, owner?: BaseCharacter }) {
        super({ name, description, portraitName, cardType, tooltip, characterData, size });
        this.targetingType = targetingType || TargetingType.ENEMY;
        this.owner = owner;
    }

    public baseDamage: number = 0
    public baseBlock: number = 0
    public baseMagicNumber: number = 0

    get hoveredCharacter(): BaseCharacter | undefined {
        return GameState.getInstance().combatState.characterHoveredOver_transient;
    }
    get combatState() : CombatState{
        return GameState.getInstance().combatState;
    }
    get actionManager() : ActionManager{
        return ActionManager.getInstance();
    }

    get ice(): CombatResource {
        return this.combatResources.ice;
    }

    get pages(): CombatResource {
        return this.combatResources.pages;
    }

    get iron(): CombatResource {
        return this.combatResources.iron;
    }

    get gold(): CombatResource {
        return this.combatResources.gold;
    }

    get fog(): CombatResource {
        return this.combatResources.fog;
    }

    get thunder(): CombatResource {
        return this.combatResources.thunder;
    }

    protected dealDamageToTarget(targetCard?: IBaseCharacter): void {
        if (targetCard) {
            this.actionManager.dealDamage({
                baseDamageAmount: this.getBaseDamageAfterResourceScaling(),
                target: targetCard,
                sourceCharacter: this.owner,
                fromAttack: true,
                sourceCard: this
            });
            console.log(`Dealt ${this.getDisplayedDamage()} damage to ${targetCard.name}`);
        }
    }

    private getRelevantResourceValue(resourceScaling: CardResourceScaling): number{
        var resources = GameState.getInstance().combatState.combatResources
        return resources.getCombatResource(resourceScaling.resource).value
    }
    
    protected applyBlockToTarget(targetCard?: IBaseCharacter): void {
        if (targetCard) {
            this.actionManager.applyBlock({
                blockTargetCharacter: targetCard,
                baseBlockValue: this.getBaseBlockAfterResourceScaling(),
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


    public getDisplayedBlock(targetedCharacterIfAny?: BaseCharacter):string{
        if (!this.owner) {
            return this.getBaseBlockAfterResourceScaling().toString();
        }

        return CombatRules.calculateBlockSentToCharacterByCard(this, this.owner as BaseCharacter, targetedCharacterIfAny as BaseCharacter).toString();
    }
    public getBaseDamageAfterResourceScaling(): number {
        let scaledDamage = this.baseDamage;

        // Apply resource scalings
        for (const scaling of this.resourceScalings) {
            scaledDamage += (scaling.attackScaling ?? 0) + this.getRelevantResourceValue(scaling);
        }

        return scaledDamage;
    }

    public getBaseBlockAfterResourceScaling(): number {
        let scaledBlock = this.baseBlock;

        // Apply resource scalings
        for (const scaling of this.resourceScalings) {
            scaledBlock += (scaling.blockScaling ?? 0) + this.getRelevantResourceValue(scaling);
        }

        return scaledBlock;
    }

    public getBaseMagicNumberAfterResourceScaling(): number {
        let scaledMagicNumber = this.baseMagicNumber;

        // Apply resource scalings
        for (const scaling of this.resourceScalings) {
            scaledMagicNumber += (scaling.magicNumberScaling ?? 0) + this.getRelevantResourceValue(scaling);
        }

        return scaledMagicNumber;
    }

    public getDisplayedDamage(selectedCharacter?: BaseCharacter): string{
        if (!this.owner) {
            return this.baseDamage.toString();
        }

        var targetedCharacterIfAny = selectedCharacter ?? this.hoveredCharacter;

        const damageCalcResult = CombatRules.calculateDamage({
            baseDamageAmount: this.baseDamage,
            target: targetedCharacterIfAny,
            sourceCharacter: this.owner,
            sourceCard: this,
            fromAttack: true
        });

        let totalDamage = damageCalcResult.totalDamage;


        return totalDamage.toString();
    }

    public getDisplayedMagicNumber(targetedCharacterIfAny?: BaseCharacter): string{
        return this.getBaseMagicNumberAfterResourceScaling().toString();
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

export interface CardResourceScaling{
    resource: CombatResource
    attackScaling?: number
    blockScaling?: number
    magicNumberScaling?: number
}
