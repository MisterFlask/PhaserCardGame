import { AbstractCombatResource } from "../rules/combatresources/AbstractCombatResource";
import { Ashes } from "../rules/combatresources/AshesResource";
import { BloodResource } from "../rules/combatresources/BloodResource";
import { MettleResource } from "../rules/combatresources/MettleResource";
import { PluckResource } from "../rules/combatresources/PluckResource";
import { SmogResource } from "../rules/combatresources/SmogResource";
import { VentureResource } from "../rules/combatresources/VentureResource";
import { CombatRules, DamageCalculationResult } from "../rules/CombatRules";
import { CombatResources, CombatState, GameState } from "../rules/GameState";
import { BaseCharacterType } from "../Types";
import { TransientUiState } from "../ui/TransientUiState";
import type { ActionManager } from "../utils/ActionManager";
import { ActionManagerFetcher } from "../utils/ActionManagerFetcher";
import { AbstractCard, TargetingType, Team } from "./AbstractCard";
import { BaseCharacter } from "./BaseCharacter";
import { BaseCharacterClass, PlayerCharacter } from "./BaseCharacterClass";
import type { AbstractBuff } from "./buffs/AbstractBuff";
import { IBaseCharacter } from "./IBaseCharacter";
import { CardSize, CardType } from "./Primitives";

export class EntityRarity {
    private constructor({
        id,
        weight,
        color,
        basePrice,
        baseCardLevel
    }: {
        id: string;
        weight: number;
        color: number;
        basePrice: number;
        baseCardLevel: number;
    }) {
        this.id = id;
        this.weight = weight;
        this.color = color;
        this.basePrice = basePrice;
        this.basePowerLevel = baseCardLevel;
    }

    public readonly id: string;
    public readonly weight: number;
    public readonly color: number;
    public readonly basePrice: number;
    public readonly basePowerLevel: number;
    
    static readonly TOKEN = new EntityRarity({ id: "TOKEN", weight: 0, color: 0xA0A0A0, basePrice: 25, baseCardLevel: 0 });
    static readonly BASIC = new EntityRarity({ id: "BASIC", weight: 1, color: 0xA0A0A0, basePrice: 25, baseCardLevel: 0 });
    static readonly COMMON = new EntityRarity({ id: "COMMON", weight: 2, color: 0xA0A0A0, basePrice: 50, baseCardLevel: 1 });
    static readonly UNCOMMON = new EntityRarity({ id: "UNCOMMON", weight: 3, color: 0x87CEEB, basePrice: 100, baseCardLevel: 2 });
    static readonly RARE = new EntityRarity({ id: "RARE", weight: 4, color: 0xDDA0DD, basePrice: 200, baseCardLevel: 3 });
    static readonly EPIC = new EntityRarity({ id: "EPIC", weight: 5, color: 0xFF69B4, basePrice: 350, baseCardLevel: 4 });
    static readonly LEGENDARY = new EntityRarity({ id: "LEGENDARY", weight: 6, color: 0xFFD700, basePrice: 500, baseCardLevel: 5 });
    static readonly SPECIAL = new EntityRarity({ id: "SPECIAL", weight: 7, color: 0xFF4500, basePrice: 400, baseCardLevel: 7 });

    toString(): string {
        return this.id;
    }

    static fromString(str: string): EntityRarity {
        const value = (EntityRarity as any)[str];
        if (!value) {
            throw new Error(`Invalid CardRarity: ${str}`);
        }
        return value;
    }

    static getAllRarities(): EntityRarity[] {
        return [
            EntityRarity.TOKEN,
            EntityRarity.BASIC,
            EntityRarity.COMMON,
            EntityRarity.UNCOMMON,
            EntityRarity.RARE,
            EntityRarity.EPIC,
            EntityRarity.LEGENDARY,
            EntityRarity.SPECIAL
        ];
    }

    isAtLeastAsRareAs(other: EntityRarity): boolean {
        return this.weight >= other.weight;
    }
}

export abstract class PlayableCard extends AbstractCard {
    targetingType: TargetingType;
    override typeTag = "PlayableCard";

    rarity: EntityRarity; // Added card rarity
    nativeToCharacterClass?: BaseCharacterClass;
    resourceScalings: CardResourceScaling[] = [];
    constructor({ name, description, portraitName, cardType, tooltip, characterData, size, targetingType, owner, price: surfaceValue, rarity }: { name: string; description?: string; portraitName?: string; cardType?: CardType; tooltip?: string; characterData?: AbstractCard; size?: CardSize; targetingType?: TargetingType; owner?: IBaseCharacter; price?: number; rarity?: EntityRarity }) {
        super({ name, description: description ?? "_", portraitName, cardType, tooltip, characterData, size });
        this.targetingType = targetingType ?? TargetingType.ENEMY;
        this.owner = owner as PlayerCharacter;
        this.rarity = rarity ?? EntityRarity.COMMON;
        this.surfacePurchaseValue = surfaceValue ?? this.rarity.basePrice;
        this.hellPurchaseValue = this.rarity.basePrice;
        this.cardType = cardType ?? CardType.SKILL;
    }

    withOwner(owner: PlayerCharacter): this {
        this.owner = owner;
        return this;
    }

    /**
     * DO NOT OVERRIDE.
     */
    forEachAlly(callback: (ally: BaseCharacter) => void): void {
        this.combatState.playerCharacters
            .filter(char => char.team === Team.ALLY)
            .forEach(callback);
    }

    withBuffs(buffs: AbstractBuff[]): this {
        this.buffs = buffs;
        return this;
    }

    /**
     * DO NOT OVERRIDE.
     */
    forEachEnemy(callback: (enemy: BaseCharacter) => void): void {
        this.combatState.enemies
            .filter(char => char.team === Team.ENEMY)
            .forEach(callback);
    }

    /**
     * DO NOT OVERRIDE.
     */
    performActionOnRandomEnemy(callback: (enemy: BaseCharacter) => void): void {
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

    //// HELPER METHODS////
    allPartyMembers(): BaseCharacter[] {
        return [...this.combatState.playerCharacters];
    }
    
    allEnemies(): BaseCharacter[] {
        return [...this.combatState.enemies];
    }

    

    /**
     * DO NOT OVERRIDE.
     */
    public ownedBy(owner: PlayerCharacter): this {
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
        var card = TransientUiState.getInstance().hoveredCard
        if (!card) {
            return undefined;
        }
        if (card.data.isBaseCharacter()){
            return card.data as BaseCharacterType;            
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

    get pluck(): PluckResource {
        return this.combatResources.pluck;
    }

    get pages(): Ashes {
        return this.combatResources.pages;
    }

    get mettle(): MettleResource {
        return this.combatResources.iron;
    }

    get venture(): VentureResource {
        return this.combatResources.venture;
    }

    get smog(): SmogResource {
        return this.combatResources.smog;
    }

    get blood(): BloodResource {
        return this.combatResources.powder;
    }

    /**
     * DO NOT OVERRIDE.
     */
    protected dealDamageToTarget(targetCard?: AbstractCard, baseDamageOverride?: number, callback?: (damageResult: DamageCalculationResult) => void): void {
        if (!(targetCard instanceof BaseCharacter)) {
            return;
        }
        if (targetCard) {
            this.actionManager.dealDamage({
                baseDamageAmount: baseDamageOverride ?? this.getBaseDamageAfterResourceScaling(),
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
    randomEnemy(): BaseCharacter | undefined {
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
            return "[color=cyan]" + this.getBaseBlockAfterResourceScaling().toString() + "[/color]";
        }

        return "[color=cyan]" + CombatRules.calculateBlockSentToCharacterByCard(this, this.owner as IBaseCharacter, targetedCharacterIfAny as IBaseCharacter).toString() + "[/color]";
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
            return "[color=red]" + this.getBaseDamageAfterResourceScaling().toString() + "[/color]";
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

        return "[color=red]" + totalDamage.toString() + "[/color]";
    }

    public get energyCost(): number {
        return this.baseEnergyCost + this.buffs.reduce((acc, buff) => acc + buff.energyCostModifier(), 0);
    }

    public getDisplayedMagicNumber(targetedCharacterIfAny?: IBaseCharacter): string {
        return "[color=lightgreen]" + this.getBaseMagicNumberAfterResourceScaling().toString() + "[/color]";
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
        this.physicalCard?.setGlow(true); // Example: Green tint for selection
    }

    public unhighlight(): void {
        this.physicalCard?.setGlow(false);
    }

    initialize(): void {
        this.buffs.forEach(buff => buff.moveToMainDescription = true);
    }
}

export interface CardResourceScaling {
    resource: AbstractCombatResource;
    attackScaling?: number;
    blockScaling?: number;
    magicNumberScaling?: number;
}