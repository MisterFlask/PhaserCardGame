import { AbstractCombatResource } from "../rules/combatresources/AbstractCombatResource";
import { IronResource } from "../rules/combatresources/IronResource";
import { PagesResource } from "../rules/combatresources/PagesResource";
import { PluckResource } from "../rules/combatresources/PluckResource";
import { PowderResource } from "../rules/combatresources/PowderResource";
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
import type { AbstractBuff } from "./buffs/AbstractBuff";
import { PlayerCharacter } from "./CharacterClasses";
import { IBaseCharacter } from "./IBaseCharacter";
import { CardSize, CardType } from "./Primitives";

export class CardRarity {
    private constructor({
        id,
        weight,
        color,
        basePrice
    }: {
        id: string;
        weight: number;
        color: string;
        basePrice: number;
    }) {
        this.id = id;
        this.weight = weight;
        this.color = color;
        this.basePrice = basePrice;
    }

    public readonly id: string;
    public readonly weight: number;
    public readonly color: string;
    public readonly basePrice: number;

    static readonly TOKEN = new CardRarity({ id: "TOKEN", weight: 0, color: "#A0A0A0", basePrice: 0 });
    static readonly BASIC = new CardRarity({ id: "BASIC", weight: 1, color: "#FFFFFF", basePrice: 50 });
    static readonly COMMON = new CardRarity({ id: "COMMON", weight: 2, color: "#90EE90", basePrice: 100 });
    static readonly UNCOMMON = new CardRarity({ id: "UNCOMMON", weight: 3, color: "#87CEEB", basePrice: 175 });
    static readonly RARE = new CardRarity({ id: "RARE", weight: 4, color: "#DDA0DD", basePrice: 250 });
    static readonly EPIC = new CardRarity({ id: "EPIC", weight: 5, color: "#FF69B4", basePrice: 350 });
    static readonly LEGENDARY = new CardRarity({ id: "LEGENDARY", weight: 6, color: "#FFD700", basePrice: 500 });
    static readonly SPECIAL = new CardRarity({ id: "SPECIAL", weight: 7, color: "#FF4500", basePrice: 400 });

    toString(): string {
        return this.id;
    }

    static fromString(str: string): CardRarity {
        const value = (CardRarity as any)[str];
        if (!value) {
            throw new Error(`Invalid CardRarity: ${str}`);
        }
        return value;
    }

    static getAllRarities(): CardRarity[] {
        return [
            CardRarity.TOKEN,
            CardRarity.BASIC,
            CardRarity.COMMON,
            CardRarity.UNCOMMON,
            CardRarity.RARE,
            CardRarity.EPIC,
            CardRarity.LEGENDARY,
            CardRarity.SPECIAL
        ];
    }

    isAtLeastAsRareAs(other: CardRarity): boolean {
        return this.weight >= other.weight;
    }
}

export abstract class PlayableCard extends AbstractCard {
    targetingType: TargetingType;
    override typeTag = "PlayableCard";

    rarity: CardRarity; // Added card rarity

    resourceScalings: CardResourceScaling[] = [];
    constructor({ name, description, portraitName, cardType, tooltip, characterData, size, targetingType, owner, price: surfaceValue, rarity }: { name: string; description?: string; portraitName?: string; cardType?: CardType; tooltip?: string; characterData?: AbstractCard; size?: CardSize; targetingType?: TargetingType; owner?: IBaseCharacter; price?: number; rarity?: CardRarity }) {
        super({ name, description: description ?? "_", portraitName, cardType, tooltip, characterData, size });
        this.targetingType = targetingType ?? TargetingType.ENEMY;
        this.owner = owner as PlayerCharacter;
        this.rarity = rarity ?? CardRarity.COMMON;
        this.surfacePurchaseValue = surfaceValue ?? this.rarity.basePrice;
        this.hellPurchaseValue = this.rarity.basePrice;
        this.cardType = cardType ?? CardType.NON_PLAYABLE;
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

    get pages(): PagesResource {
        return this.combatResources.pages;
    }

    get iron(): IronResource {
        return this.combatResources.iron;
    }

    get venture(): VentureResource {
        return this.combatResources.venture;
    }

    get smog(): SmogResource {
        return this.combatResources.smog;
    }

    get powder(): PowderResource {
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
        this.physicalCard?.setGlow(true); // Example: Green tint for selection
    }

    public unhighlight(): void {
        this.physicalCard?.setGlow(false);
    }

}

export interface CardResourceScaling {
    resource: AbstractCombatResource;
    attackScaling?: number;
    blockScaling?: number;
    magicNumberScaling?: number;
}