import type { AbstractCombatEvent } from "../../rules/AbstractCombatEvent";
import type { DamageInfo } from "../../rules/DamageInfo";
import { GameState } from "../../rules/GameState";
import { ActionManager } from "../../utils/ActionManager";
import { ActionManagerFetcher } from "../../utils/ActionManagerFetcher";
import { generateWordGuid } from "../AbstractCard";
import type { BaseCharacter } from "../BaseCharacter";
import type { IAbstractBuff } from '../IAbstractBuff';
import { IBaseCharacter } from '../IBaseCharacter';
import type { PlayableCard } from "../PlayableCard";
export abstract class AbstractBuff implements IAbstractBuff {

    get actionManager(): ActionManager {
        return ActionManagerFetcher.getActionManager();
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
    public getOwnerAsPlayableCard(): PlayableCard | null {
        // Import GameState if not already imported at the top of the file

        // Find the owner of this buff by searching through all characters in the combat state
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;
        const allPlayableCards = [...combatState.currentDrawPile, ...combatState.currentHand, ...combatState.currentDiscardPile];
        const owner = allPlayableCards.find(card => card.buffs.some(buff => buff.id === this.id));

        if (!owner) {
            console.warn(`No owner found for buff ${this.getName()} with id ${this.id}`);
            return null;
        }

        return owner as PlayableCard;
    }


    public getOwnerAsCharacter(): BaseCharacter | null {
        // Import GameState if not already imported at the top of the file

        // Find the owner of this buff by searching through all characters in the combat state
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;
        const allCharacters = [...combatState.playerCharacters, ...combatState.enemies];

        const owner = allCharacters.find(character => character.buffs.some(buff => buff.id === this.id));

        if (!owner) {
            console.warn(`No owner found for buff ${this.getName()} with id ${this.id}`);
            return null;
        }

        return owner;
    }

    /*
    * Generally you'll want to use the ActionManager method for this since that allows game animations to play.
    */
    public static _applyBuffToCharacter(character: BaseCharacter, buff: AbstractBuff) {
        if (character == null) {
            return;
        }
        if (character.buffs == null) {
            character.buffs = [];
        }
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
        if (this.stacks > 0) return `${this.stacks}`;
        else return "[stacks]";
    }
    canGoNegative: boolean = false;
    imageName: string = "PLACEHOLDER_IMAGE";
    id: string = generateWordGuid();
    stackable: boolean = true;
    // Note we have a different subsystem responsible for removing the buff once stacks is at 0.  That is not the responsibility of Invoke()
    stacks: number = 1;
    secondaryStacks: number = -1;
    showSecondaryStacks: boolean = false;
    isDebuff: boolean = false;

    abstract getName(): string;

    /**
     * make sure to use getStacksDisplayText() in the description if you want to show the number of stacks.
     */
    abstract getDescription(): string;


    // this is a FLAT modifier on top of damage taken, not percentage-based.
    //  this refers to pre-block damage.
    getCombatDamageDealtModifier(target?: BaseCharacter): number {
        return 0;
    }

    getBlockSentModifier(): number {
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
    getCombatDamageTakenModifier(): number {
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
    onOwnerStruck(strikingUnit: IBaseCharacter | null, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo) {

    }

    /**
     * This is called when the owner of the buff is striking another unit.  It CANNOT BE USED to modify damage dealt; use getPercentCombatDamageDealtModifier or getCombatDamageDealtModifier instead for that.
     */
    onOwnerStriking(struckUnit: IBaseCharacter, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo) {

    }

    onTurnStart() {

    }

    onTurnEnd() {

    }

    onBuffApplied(character: IBaseCharacter, buffApplied: AbstractBuff, previousStacks: number, changeInStacks: number) {

    }

    onEvent(item: AbstractCombatEvent) {

    }

    onCombatStart(){

    }

    onCombatEnd(){

    }


    ////////////////// PLAYABLE CARD METHODS //////////////////

    public onDiscard(){

    }

    public onThisCardInvoked(target?: BaseCharacter){

    }

    public onAnyCardPlayed(playedCard: PlayableCard, target?: BaseCharacter){

    }

    public onLethal(target: BaseCharacter | null){

    }

    public onExhaust(){

    }


    // 
    public onFatal(killedUnit: BaseCharacter){
        
    }

    // Applies to character buffs ONLY.  If true, buff is not removed at end of combat.
    public isPersistentBetweenCombats: boolean = false;

    // Applies to character buffs ONLY.  If true, buff is not removed at end of the run (meaning it's basically forever on this character)
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

    
}
