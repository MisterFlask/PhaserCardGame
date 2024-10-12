import { CombatRules, DamageCalculationResult } from "../rules/CombatRules";
import { CombatResource, CombatResources, CombatState, GameState } from "../rules/GameState";
import { BaseCharacterType } from "../Types";
import type { ActionManager } from "../utils/ActionManager";
import { ActionManagerFetcher } from "../utils/ActionManagerFetcher";
import { AbstractCard, TargetingType, Team } from "./AbstractCard";
import { BaseCharacter } from "./BaseCharacter";
import { IBaseCharacter } from "./IBaseCharacter";
import { CardSize, CardType } from "./Primitives";

export enum CardRarity {
    TOKEN,
    COMMON,
    UNCOMMON,
    RARE,
    EPIC,
    LEGENDARY,
    SPECIAL
}

export abstract class PlayableCard extends AbstractCard {
    targetingType: TargetingType;
    override typeTag = "PlayableCard";
    price: number;
    rarity: CardRarity; // Added card rarity

    resourceScalings: CardResourceScaling[] = [];
    constructor({ name, description, portraitName, cardType, tooltip, characterData, size, targetingType, owner, price, rarity }: { name: string; description?: string; portraitName?: string; cardType?: CardType; tooltip?: string; characterData?: AbstractCard; size?: CardSize; targetingType?: TargetingType; owner?: IBaseCharacter; price?: number; rarity?: CardRarity }) {
        super({ name, description: description ?? "_", portraitName, cardType, tooltip, characterData, size });
        this.targetingType = targetingType ?? TargetingType.ENEMY;
        this.owner = owner;
        this.price = price ?? 100;
        this.rarity = rarity ?? CardRarity.COMMON; // Default to COMMON if not provided
    }

    /**
     * DO NOT OVERRIDE.
     */
    forEachAlly(callback: (ally: IBaseCharacter) => void): void {
        this.combatState.playerCharacters
            .filter(char => char.team === Team.ALLY)
            .forEach(callback);
    }

    /**
     * DO NOT OVERRIDE.
     */
    forEachEnemy(callback: (enemy: IBaseCharacter) => void): void {
        this.combatState.enemies
            .filter(char => char.team === Team.ENEMY)
            .forEach(callback);
    }

    /**
     * DO NOT OVERRIDE.
     */
    performActionOnRandomEnemy(callback: (enemy: IBaseCharacter) => void): void {
        const randomEnemy = this.randomEnemy();
        if (randomEnemy) {
            callback(randomEnemy);
        }
    }

    OnPurchase(): void {
        console.log('Item purchased');
    }


    isUnplayable(): boolean {
        return false;
    }

    /**
     * DO NOT OVERRIDE.
     */
    public ownedBy(owner: IBaseCharacter): this {
        this.owner = owner;
        return this;
    }

    public baseDamage: number = 0;
    public baseBlock: number = 0;
    public baseMagicNumber: number = 0;

    /**
     * DO NOT OVERRIDE.
     */
    get hoveredCharacter(): IBaseCharacter | undefined {
        var card = GameState.getInstance().combatState.cardHoveredOver_transient;
        if (!card) {
            return undefined;
        }
        if (card.isBaseCharacter()){
            return card as BaseCharacterType;            
        }
        return undefined;
    }

    /**
     * DO NOT OVERRIDE.
     */
    get combatState(): CombatState {
        return GameState.getInstance().combatState;
    }
    /**
     * DO NOT OVERRIDE.
     */
    get actionManager(): ActionManager {
        return ActionManagerFetcher.getActionManager();
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
        return this.combatResources.venture;
    }

    get fog(): CombatResource {
        return this.combatResources.fog;
    }

    get powder(): CombatResource {
        return this.combatResources.powder;
    }

    /**
     * DO NOT OVERRIDE.
     */
    protected dealDamageToTarget(targetCard?: AbstractCard, callback?: (damageResult: DamageCalculationResult) => void): void {
        if (!(targetCard instanceof BaseCharacter)) {
            return;
        }
        if (targetCard) {
            this.actionManager.dealDamage({
                baseDamageAmount: this.getBaseDamageAfterResourceScaling(),
                target: targetCard,
                sourceCharacter: this.owner,
                fromAttack: true,
                sourceCard: this,
                callback: callback
            });
            console.log(`Dealt ${this.getDisplayedDamage()} damage to ${targetCard.name}`);
        }
    }

    /**
     * DO NOT OVERRIDE.
     */
    private getRelevantResourceValue(resourceScaling: CardResourceScaling): number {
        var resources = GameState.getInstance().combatState.combatResources;
        return resources.getCombatResource(resourceScaling.resource).value;
    }

    /**
     * DO NOT OVERRIDE.
     */
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

    onAcquisition(newOwner: BaseCharacter){

    }

    /**
     * DO NOT OVERRIDE.
     */
    get combatResources(): CombatResources {
        return GameState.getInstance().combatState.combatResources;
    }

    /**
     * DO NOT OVERRIDE.
     */
    randomEnemy(): IBaseCharacter | undefined {
        const livingEnemies = this.combatState.enemies.filter(enemy => enemy.hitpoints > 0);

        if (livingEnemies.length === 0) {
            return undefined;
        }

        return livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
    }

    /**
     * DO NOT OVERRIDE.
     */
    public getDisplayedBlock(targetedCharacterIfAny?: IBaseCharacter): string {
        if (!this.owner) {
            return this.getBaseBlockAfterResourceScaling().toString();
        }

        return CombatRules.calculateBlockSentToCharacterByCard(this, this.owner as IBaseCharacter, targetedCharacterIfAny as IBaseCharacter).toString();
    }
    /**
     * DO NOT OVERRIDE.
     */
    public getBaseDamageAfterResourceScaling(): number {
        let scaledDamage = this.baseDamage;

        // Apply resource scalings
        for (const scaling of this.resourceScalings) {
            scaledDamage += (scaling.attackScaling ?? 0) + this.getRelevantResourceValue(scaling);
        }

        return scaledDamage;
    }

    /**
     * DO NOT OVERRIDE.
     */
    public getBaseBlockAfterResourceScaling(): number {
        let scaledBlock = this.baseBlock;

        // Apply resource scalings
        for (const scaling of this.resourceScalings) {
            scaledBlock += (scaling.blockScaling ?? 0) + this.getRelevantResourceValue(scaling);
        }

        return scaledBlock;
    }

    /**
     * DO NOT OVERRIDE.
     */
    public getBaseMagicNumberAfterResourceScaling(): number {
        let scaledMagicNumber = this.baseMagicNumber;

        // Apply resource scalings
        for (const scaling of this.resourceScalings) {
            scaledMagicNumber += (scaling.magicNumberScaling ?? 0) + this.getRelevantResourceValue(scaling);
        }

        return scaledMagicNumber;
    }

    /**
     * DO NOT OVERRIDE.
     */
    public getDisplayedDamage(selectedCharacter?: IBaseCharacter): string {
        if (!this.owner) {
            return this.getBaseDamageAfterResourceScaling().toString();
        }

        var targetedCharacterIfAny = selectedCharacter ?? this.hoveredCharacter;

        const damageCalcResult = CombatRules.calculateDamage({
            baseDamageAmount: this.getBaseDamageAfterResourceScaling(),
            target: targetedCharacterIfAny,
            sourceCharacter: this.owner,
            sourceCard: this,
            fromAttack: true
        });

        let totalDamage = damageCalcResult.totalDamage;

        return totalDamage.toString();
    }

    public getDisplayedMagicNumber(targetedCharacterIfAny?: IBaseCharacter): string {
        return this.getBaseMagicNumberAfterResourceScaling().toString();
    }

    abstract InvokeCardEffects(targetCard?: AbstractCard): void;

    public IsPerformableOn(targetCard?: AbstractCard): boolean {
        return true;
    }

    private IsIBaseCharacter(targetCard?: AbstractCard): boolean {
        if (!targetCard) {
            return false;
        }
        return ('hitpoints' in targetCard && 'maxHitpoints' in targetCard && 'gender' in targetCard)
    }

    public IsPerformableOn_Outer(targetCard?: AbstractCard): boolean {

        if (this.targetingType === TargetingType.NO_TARGETING) {
            return true;
        }

        if (!targetCard || !this.IsIBaseCharacter(targetCard)) { // ugh, close enough
            return false;
        }

        const isTargetAlly = this.IsIBaseCharacter(targetCard) && targetCard.team === Team.ALLY;
        const isTargetEnemy = this.IsIBaseCharacter(targetCard) && targetCard.team === Team.ENEMY;
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

    public highlight(): void {
        this.physicalCard?.highlight(); // Example: Green tint for selection
    }

    public unhighlight(): void {
        this.physicalCard?.unhighlight();
    }
}

export interface CardResourceScaling {
    resource: CombatResource;
    attackScaling?: number;
    blockScaling?: number;
    magicNumberScaling?: number;
}