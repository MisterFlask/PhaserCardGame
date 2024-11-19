import type { AbstractCombatEvent } from "../../rules/AbstractCombatEvent";
import type { DamageInfo } from "../../rules/DamageInfo";
import type { CombatResources, CombatState, GameState } from "../../rules/GameState";
import type { ActionManager } from "../../utils/ActionManager";
import { ActionManagerFetcher } from "../../utils/ActionManagerFetcher";
import type { AbstractCard } from "../AbstractCard";
import { generateWordGuid } from "../AbstractCard";
import type { BaseCharacter } from "../BaseCharacter";
import { PlayerCharacter } from "../BaseCharacterClass";
import type { IAbstractBuff } from '../IAbstractBuff';
import { IBaseCharacter } from '../IBaseCharacter';
import type { PlayableCard } from "../PlayableCard";
export abstract class AbstractBuff implements IAbstractBuff {

    get actionManager(): ActionManager {
        return ActionManagerFetcher.getActionManager();
    }

    get combatState(): CombatState {
        return ActionManagerFetcher.getGameState().combatState;
    }

    get gameState(): GameState {
        return ActionManagerFetcher.getGameState();
    }

    get combatResources(): CombatResources {
        return this.combatState.combatResources;
    }

    constructor() {
        this.imageName = "PLACEHOLDER_IMAGE";
        this.id = generateWordGuid();
        this.stackable = true;
        this.stacks = 1;
        this.secondaryStacks = -1;
        this.showSecondaryStacks = false;
        this.isDebuff = false;
        this.canGoNegative = false;
    }

    protected forEachAlly(callback: (ally: BaseCharacter) => void): void {
        const playerCharacters = this.gameState.combatState.playerCharacters;
        playerCharacters.forEach(callback);
    }

    public generateSeededRandomBuffColor(): number {
        let hash = 0;
        for (let i = 0; i < this.getName().length; i++) {
            const char = this.getName().charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        const r = (hash & 255);
        const g = ((hash >> 8) & 255);
        const b = ((hash >> 16) & 255);

        return (r << 16) | (g << 8) | b;
    }

    public pulseBuff(){
        this.actionManager.pulseBuff(this);
        this.actionManager.displaySubtitle(this.getName(), 500);
    }

    public getOwnerAsPlayableCard(): PlayableCard | null {
        // Import GameState if not already imported at the top of the file

        // Find the owner of this buff by searching through all characters in the combat state
        const combatState = this.gameState.combatState;
        const allPlayableCards = [...combatState.currentDrawPile, ...combatState.currentHand, ...combatState.currentDiscardPile];
        const owner = allPlayableCards.find(card => card.buffs.some(buff => buff.id === this.id));

        if (!owner) {
            console.warn(`No owner found for buff ${this.getName()} with id ${this.id}`);
            return null;
        }

        return owner as PlayableCard;
    }

    public getOwnerAsCharacter(): PlayerCharacter | null {
        // Import GameState if not already imported at the top of the file

        // Find the owner of this buff by searching through all characters in the combat state
        const combatState = this.gameState.combatState;
        const allCharacters = [...combatState.playerCharacters, ...combatState.enemies];

        const owner = allCharacters.find(character => character.buffs.some(buff => buff.id === this.id));

        if (!owner) {
            console.warn(`No owner found for buff ${this.getName()} with id ${this.id}`);
            return null;
        }

        return owner as PlayerCharacter;
    }

    /*
    * Generally you'll want to use the ActionManager method for this since that allows game animations to play.
    */
    public static _applyBuffToCharacterOrCard(character: AbstractCard, buff: AbstractBuff) {
        if (character == null) {
            return;
        }
        if (character.buffs == null) {
            character.buffs = [];
        }

        // Check for buff interception from existing buffs
        let changeInStacks = buff.stacks;
        const previousStacks = character.buffs.find(b => b.constructor === buff.constructor)?.stacks || 0;

        for (const existingBuff of character.buffs) {
            const interceptionResult = existingBuff.interceptBuffApplication(character, buff, previousStacks, changeInStacks);
            if (interceptionResult.logicTriggered) {
                changeInStacks = interceptionResult.newChangeInStacks;
                if (changeInStacks <= 0) {
                    return; // Buff was fully intercepted
                }
            }
        }
        buff.stacks = changeInStacks;


        // Check if the character already has a buff of the same type
        let existingBuff = character.buffs.find(existingBuff => existingBuff.constructor === buff.constructor);
        if (existingBuff) {
            existingBuff = existingBuff as AbstractBuff
            if (existingBuff.stackable) {
                // If the buff is stackable, increase its stack count
                existingBuff.stacks += buff.stacks;
            } else {
                // If the buff is not stackable, we'll just log this information
                console.log(`Buff ${existingBuff.getName()} is not stackable. Ignoring new application.`);
            }
            // If not stackable, we don't add a new one or modify the existing one
        } else {
            // If the buff doesn't exist, add it to the character's buffs
            character.buffs.push(buff);
        }

        if (!buff.stackable && buff.stacks > 1){
            buff.stacks = 1;
        }
    }

    getStacksDisplayText(): string {
        if (this.helpMode) {
            return "[color=gold](stacks)[/color]";
        }
        return `[color=gold]${this.stacks}[/color]`;
    }
    
    canGoNegative: boolean = false;
    imageName: string = "PLACEHOLDER_IMAGE";
    id: string = generateWordGuid();
    stackable: boolean = true;
    // Note we have a different subsystem responsible for removing the buff once stacks is at 0.  That is not the responsibility of Invoke()
    secondaryStacks: number = -1;
    showSecondaryStacks: boolean = false;
    isDebuff: boolean = false;
    valueMod: number = 0;
    public helpMode: boolean = false;
    private _stacks: number = 1;

    get stacks(): number {
        return this._stacks;
    }

    set stacks(value: number) {
        this._stacks = value;
        if (this._stacks <= 0 && !this.canGoNegative) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                const index = owner.buffs.indexOf(this);
                if (index > -1) {
                    owner.buffs.splice(index, 1);
                }
            }
            // if the owner is a card:
            const ownerCard = this.getOwnerAsPlayableCard();
            if (ownerCard) {
                const index = ownerCard.buffs.indexOf(this);
                if (index > -1) {
                    ownerCard.buffs.splice(index, 1);
                }
            }
        }
    }


    abstract getName(): string;

    /**
     * make sure to use getStacksDisplayText() in the description if you want to show the number of stacks.
     */
    abstract getDescription(): string;


    onRunStart(): void {

    }

    energyCostModifier(): number {
        return 0;
    }

    // this is a FLAT modifier on top of damage taken, not percentage-based.
    //  this refers to pre-block damage.
    getCombatDamageDealtModifier(target?: BaseCharacter, cardPlayed?: PlayableCard): number {
        return 0;
    }

    getBlockSentModifier(target: IBaseCharacter): number {
        return 0;
    }

    getCardsDrawnAtStartOfTurnModifier(): number {
        return 0;
    }

    // this is a percentage modifier on top of damage sent by the owner.  If this is "100" that means 100% more damage is sent.  If this is -100 then this means the character does no damage.  Standard is 0, which means no modifier.
    // Note this does not take into account blocking in any way.
    getAdditionalPercentCombatDamageDealtModifier(target?: IBaseCharacter): number {
        return 0;
    }
    // this is a percentage modifier on top of damage taken.  If this is "100" that means 100% more damage is taken.  If this is -100 then this means the character takes no damage.  Standard is 0, which means no modifier.
    // Note this does not take into account blocking in any way.
    getAdditionalPercentCombatDamageTakenModifier(sourceCard?: PlayableCard): number {
        return 0;
    }
    // this is a FLAT modifier on top of damage taken, not percentage-based.
    //  this refers to pre-block damage.
    getCombatDamageTakenModifier(sourceCharacter?: IBaseCharacter, sourceCard?: PlayableCard): number {
        return 0;
    }
    getBlockReceivedModifier(): number {
        return 0;
    }


    getDamagePerHitCappedAt(): number {
        return Infinity;
    }

    /**
     * This is called when the owner of the buff is struck by an attack.  It CANNOT BE USED to modify damage received; use getPercentCombatDamageTakenModifier or getCombatDamageTakenModifier instead for that.
     */
    onOwnerStruck_CannotModifyDamage(strikingUnit: IBaseCharacter | null, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo) {

    }

    /**
     * This is called when the owner of the buff is striking another unit.  It CANNOT BE USED to modify damage dealt; use getPercentCombatDamageDealtModifier or getCombatDamageDealtModifier instead for that.
     */
    onOwnerStriking_CannotModifyDamage(struckUnit: IBaseCharacter, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo) {

    }

    onTurnStart() {

    }

    onTurnEnd_CharacterBuff() {

    }

    onBuffApplied(character: IBaseCharacter, buffApplied: AbstractBuff, previousStacks: number, changeInStacks: number) {

    }

    interceptBuffApplication(character: AbstractCard, buffApplied: AbstractBuff, previousStacks: number, changeInStacks: number) : BuffApplicationResult {
        return {logicTriggered: false, newChangeInStacks: changeInStacks};
    }

    onEvent(item: AbstractCombatEvent) {

    }

    onCombatStart(){

    }

    onCombatEnd(){

    }

    hellValueModifier(): number {
        return 0;
    }

    purchasePricePercentModifier(): number {
        return 0;
    }

    surfaceValueModifier(): number {
        return 0;
    }

    ////////////////// PLAYABLE CARD METHODS //////////////////

    public onActiveDiscard(){

    }

    public onCardDrawn(): void {

    }

    public onInHandAtEndOfTurn(){

    }

    public onThisCardInvoked(target?: BaseCharacter){

    }

    public onAnyCardPlayedByAnyone(playedCard: PlayableCard, target?: BaseCharacter){

    }

    public onLethal(target: BaseCharacter | null){

    }

    public onExhaust(){

    }

    public onAcquisition(){

    }


    // 
    public onFatal(killedUnit: BaseCharacter){
        
    }


    public shouldRetainAfterTurnEnds(): boolean {
        return false;
    }

    public shouldPurgeAsStateBasedEffect(): boolean {
        return false;
    }

    // Applies to character buffs ONLY.  If true, buff is not removed at end of combat.
    public isPersistentBetweenCombats: boolean = false;

    // Applies to character buffs ONLY.  If true, buff is not removed at end of the run OR at end of combat (meaning it's basically forever on this character)
    public isPersonaTrait: boolean = false;

    // done for bloodprice buffs.
    canPayThisMuchMissingEnergy(energyNeeded: number): number {
        return 0;
    }

    // done for bloodprice buffs.
    // returns the amount of energy paid for by executing this.
    provideMissingEnergy_returnsAmountProvided(energyNeeded: number): number {
        return 0;
    }

    public clone(): this {
        const clonedBuff = Object.create(Object.getPrototypeOf(this));
        Object.assign(clonedBuff, this);
        clonedBuff.id = generateWordGuid(); // Generate new unique ID for clone
        return clonedBuff;
    }
    
}


export class BuffApplicationResult {
    newChangeInStacks: number = 0;
    logicTriggered: boolean = false;
}
