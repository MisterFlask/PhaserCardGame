import { AshesResource } from "../rules/combatresources/AshesResource";
import { BloodResource } from "../rules/combatresources/BloodResource";
import { MettleResource } from "../rules/combatresources/MettleResource";
import { PluckResource } from "../rules/combatresources/PluckResource";
import { SmogResource } from "../rules/combatresources/SmogResource";
import { VentureResource } from "../rules/combatresources/VentureResource";
import { CombatRules, DamageCalculationResult } from "../rules/CombatRulesHelper";
import { CombatResources, CombatState, GameState } from "../rules/GameState";
import { BaseCharacterType } from "../Types";
import { TransientUiState } from "../ui/TransientUiState";
import type { ActionManager } from "../utils/ActionManager";
import { ActionManagerFetcher } from "../utils/ActionManagerFetcher";
import { AbstractCard, TargetingType, Team } from "./AbstractCard";
import { BaseCharacter } from "./BaseCharacter";
import { BaseCharacterClass } from "./BaseCharacterClass";
import type { AbstractBuff } from "./buffs/AbstractBuff";
import { CardResourceScaling } from "./CardResourceScaling";
import { EntityRarity } from "./EntityRarity";
import { IBaseCharacter } from "./IBaseCharacter";
import { PlayerCharacter } from "./PlayerCharacter";
import { CardSize, CardType } from "./Primitives";

export abstract class PlayableCard extends AbstractCard {
    targetingType: TargetingType;
    override typeTag = "PlayableCard";

    rarity: EntityRarity; // Added card rarity
    nativeToCharacterClass?: BaseCharacterClass;
    resourceScalings: CardResourceScaling[] = [];
    constructor({ name, description, portraitName, cardType, tooltip, characterData, size, targetingType, owner, price: surfaceValue, rarity }: { name: string; description?: string; portraitName?: string; cardType?: CardType; tooltip?: string; characterData?: AbstractCard; size?: CardSize; targetingType?: TargetingType; owner?: IBaseCharacter; price?: number; rarity?: EntityRarity }) {
        super({ name, description: description ?? "_", portraitName, cardType, tooltip, characterData, size });
        this.targetingType = targetingType ?? TargetingType.ENEMY;
        this.owningCharacter = owner as PlayerCharacter;
        this.rarity = rarity ?? EntityRarity.COMMON;
        this.surfacePurchaseValue = surfaceValue ?? this.rarity.basePrice;
        this.hellPurchaseValue = this.rarity.basePrice;
        this.cardType = cardType ?? CardType.SKILL;
    }

    withOwner(owner: PlayerCharacter): this {
        this.owningCharacter = owner;
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

    performActionOnRandomAlly(callback: (ally: BaseCharacter) => void) {
        const randomAlly = this.randomAlly();
        if (randomAlly){
            callback(randomAlly);
        }
    }

    randomAlly(): BaseCharacter | undefined {
        const allies = this.combatState.playerCharacters.filter(char => char.team === Team.ALLY && char.hitpoints > 0);
        if (allies.length === 0) {
            return undefined;
        }
        const randomIndex = Math.floor(Math.random() * allies.length);
        return allies[randomIndex];
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
        this.owningCharacter = owner;
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

    get ashes(): AshesResource {
        return this.combatResources.ashes;
    }

    get mettle(): MettleResource {
        return this.combatResources.mettle;
    }

    get venture(): VentureResource {
        return this.combatResources.venture;
    }

    get smog(): SmogResource {
        return this.combatResources.smog;
    }

    get blood(): BloodResource {
        return this.combatResources.blood;
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
                sourceCharacter: this.owningCharacter,
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
    protected applyBlockToTarget(targetCard?: IBaseCharacter, blockOverride?: number): void {
        if (targetCard) {
            this.actionManager.applyBlock({
                blockTargetCharacter: targetCard,
                baseBlockValue: blockOverride ?? this.getBaseBlockAfterResourceScaling(),
                appliedViaPlayableCard: this,
                blockSourceCharacter: this.owningCharacter
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
        if (!this.owningCharacter) {
            return "[color=cyan]" + this.getBaseBlockAfterResourceScaling().toString() + "[/color]";
        }

        return "[color=cyan]" + CombatRules.calculateBlockSentToCharacterByCard(this, this.owningCharacter as IBaseCharacter, targetedCharacterIfAny as IBaseCharacter).toString() + "[/color]";
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
        if (!this.owningCharacter) {
            return "[color=red]" + this.getBaseDamageAfterResourceScaling().toString() + "[/color]";
        }

        var targetedCharacterIfAny = selectedCharacter ?? this.hoveredCharacter;

        const damageCalcResult = CombatRules.calculateDamage({
            baseDamageAmount: this.getBaseDamageAfterResourceScaling(),
            target: targetedCharacterIfAny,
            sourceCharacter: this.owningCharacter,
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
        this.physicalCard!.isSelected = true;
        this.physicalCard!.setGlow(true); // Example: Green tint for selection
    }

    public unhighlight(): void {
        this.physicalCard!.isSelected = false;
        this.physicalCard!.setGlow(false);
    }

    initialize(): void {
        this.buffs.forEach(buff => buff.moveToMainDescription = true);
    }

    public override Copy(): this {
        const copy = super.Copy();
        copy.baseDamage = this.baseDamage;
        copy.baseBlock = this.baseBlock;
        copy.baseMagicNumber = this.baseMagicNumber;

        copy.resourceScalings = this.resourceScalings.slice().map(item => this.copyResourceScaling(item));
        return copy;
    }

    public standardUpgrade(inPlace: boolean = true): this{
        if (inPlace){
            var newCard = this;
        }
        else{
            var newCard = this.Copy();
        }

        if (newCard.baseDamage > 0){
            newCard.baseDamage *= 1.4;
            newCard.baseDamage = Math.round(newCard.baseDamage);
            if (newCard.baseDamage == this.baseDamage){
                newCard.baseDamage += 1;
            }
        }
        else if (newCard.baseBlock > 0){
            newCard.baseBlock *= 1.4;
            newCard.baseBlock = Math.round(newCard.baseBlock);
            if (newCard.baseBlock == this.baseBlock){
                newCard.baseBlock += 1;
            }
        }
        else if (newCard.baseMagicNumber > 0){
            newCard.baseMagicNumber *= 1.4;
            newCard.baseMagicNumber = Math.round(newCard.baseMagicNumber);
            if (newCard.baseMagicNumber == this.baseMagicNumber){
                newCard.baseMagicNumber += 1;
            }
        }
        else{
            newCard.baseEnergyCost -= 1;
        }
        newCard.name = this.name + "+"
        newCard.id = this.id
        return newCard;
    }

    private copyResourceScaling(scaling: CardResourceScaling): CardResourceScaling {
        return {
            resource: scaling.resource,
            attackScaling: scaling.attackScaling,
            blockScaling: scaling.blockScaling,
            magicNumberScaling: scaling.magicNumberScaling
        };
    }
}

