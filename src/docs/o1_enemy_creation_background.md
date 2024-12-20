import { JsonRepresentable } from '../interfaces/JsonRepresentable';
import { CombatRules } from '../rules/CombatRulesHelper';
import { GameState } from '../rules/GameState';
import { PhysicalCard } from '../ui/PhysicalCard';
import { ActionManager } from "../utils/ActionManager";
import ImageUtils from '../utils/ImageUtils';
import { TargetingUtils } from "../utils/TargetingUtils";
import { AbstractCard, generateWordGuid } from "./AbstractCard";
import type { AutomatedCharacter } from './AutomatedCharacter';
import type { BaseCharacter } from "./BaseCharacter";
import type { AbstractBuff } from './buffs/AbstractBuff';
import type { PlayableCard } from './PlayableCard';

export abstract class AbstractIntent implements JsonRepresentable {
    id: string;
    imageName: string;
    target?: BaseCharacter;
    owner?: BaseCharacter;
    title: string;
    targetsAllPlayers: boolean = false;
    iconTint: number = 0xffffff;

    constructor({imageName, target, owner }: {imageName: string, target: BaseCharacter | undefined, owner?: BaseCharacter }) {
        this.imageName = imageName;
        this.target = target;
        this.owner = owner;
        this.id = generateWordGuid(this.displayText());
        this.title = '';
    }

    abstract tooltipText(): string;
    abstract displayText(): string;

    abstract act(): void;

    createJsonRepresentation(): string {
        return JSON.stringify({
            className: this.constructor.name,
            id: this.id,
            imageName: this.imageName,
            target: this.target ? this.target.name : 'No target',
            owner: this.owner?.name,
        }, null, 2);
    }

    withTitle(title: string): this {
        this.title = title;
        return this;
    }

    public generateSeededRandomColor(): number | undefined {
        if (!this.isUsingPlaceholderImage()) {
            return undefined;
        }
        let hash = 0;
        for (let i = 0; i < this.imageName.length; i++) {
            const char = this.imageName.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        const r = (hash & 255);
        const g = ((hash >> 8) & 255);
        const b = ((hash >> 16) & 255);

        return (r << 16) | (g << 8) | b;
    }


    public isUsingPlaceholderImage(): boolean {
        return !this.imageName || !ActionManager.getInstance().scene.textures.exists(this.imageName);
    }

    public getImageNameOrPlaceholderIfNoneExists(): string {
        // Check if the image exists in the texture cache
        const scene = ActionManager.getInstance().scene
        if (!scene) {
            throw new Error('Scene not set; probably you changed scenes and messed up handling deletion of old actions.');
        }
        if (this.isUsingPlaceholderImage()) {
            var placeholder = ImageUtils.getDeterministicAbstractPlaceholder(this.imageName);
            return placeholder;
        }
        return this.imageName;
    }
}

export class CosmeticCharacterBuffIntent extends AbstractIntent {
    tooltipText(): string {
        return "Incoming damage from buff: " + this.buff.getDisplayName();
    }
    displayText(): string {
        return this.damage?.toString();
    }
    act(): void {
        // no op intentionally because this handled by card buff
    }

    damage: number;
    buff: AbstractBuff;
    constructor({ buff, target, damage }: { buff: AbstractBuff, target: BaseCharacter, damage: number }) {
        super({ imageName: 'uncertainty', target: target, owner: undefined });
        this.buff = buff;
        if (!buff) {
            throw new Error('Buff cannot be null');
        }
        this.damage = damage;
        this.id = buff.id + '-' + target.id;
    }
}

export class CosmeticPlayableCardIntent extends AbstractIntent {
    tooltipText(): string {
        return "Incoming damage from your card: " + this.playableCard.name;
    }
    displayText(): string {
        return this.damage.toString();
    }
    act(): void {
        // no op intentionally because this handled by card buff
    }

    damage: number;
    playableCard: PlayableCard;
    constructor({ playableCard, target, damage }: { playableCard: PlayableCard, target: BaseCharacter, damage: number }) {
        super({ imageName: 'uncertainty', target: target, owner: undefined });
        this.playableCard = playableCard;
        this.damage = damage;
        this.id = playableCard.id + '-' + target.id;
    }
}

export class SummonIntent extends AbstractIntent {
    monsterToSummon: AutomatedCharacter;

    constructor({ monsterToSummon, owner }: { monsterToSummon: AutomatedCharacter, owner: BaseCharacter }) {
        super({ imageName: 'summon', target: undefined, owner: owner });
        this.monsterToSummon = monsterToSummon;
    }

    tooltipText(): string {
        return `Summon ${this.monsterToSummon.name}`;
    }

    displayText(): string {
        return "Summon";
    }

    act(): void {
        console.log(`Summoning ${this.monsterToSummon.name}`);
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        ActionManager.getInstance().addMonsterToCombat(this.monsterToSummon);
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            monsterToSummon: this.monsterToSummon.name,
        }, null, 2);
    }
}

export class AddCardToPileIntent extends AbstractIntent {
    cardToAdd: PlayableCard;
    pileName: 'draw' | 'discard' | 'hand';

    constructor({ cardToAdd, pileName, owner }: { cardToAdd: PlayableCard, pileName: 'draw' | 'discard' | 'hand', owner: BaseCharacter }) {
        super({ imageName: 'card-plus', target: undefined, owner: owner });
        this.cardToAdd = cardToAdd;
        this.pileName = pileName;
    }

    tooltipText(): string {
        return `Add ${this.cardToAdd.name} to ${this.pileName} pile`;
    }

    displayText(): string {
        return "Add Card";
    }

    act(): void {
        console.log(`Adding ${this.cardToAdd.name} to ${this.pileName} pile`);
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        switch (this.pileName) {
            case 'draw':
                combatState.drawPile.push(this.cardToAdd);
                break;
            case 'discard':
                combatState.currentDiscardPile.push(this.cardToAdd);
                break;
            case 'hand':
                combatState.currentHand.push(this.cardToAdd);
                break;
        }
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            cardToAdd: this.cardToAdd.name,
            pileName: this.pileName,
        }, null, 2);
    }
}



export class AttackIntent extends AbstractIntent {
    baseDamage: number;
    constructor({ target, baseDamage, owner }: { target?: BaseCharacter | undefined, baseDamage: number, owner: BaseCharacter }) {
        super({ imageName: 'knife-thrust', target: target, owner: owner });
        this.baseDamage = baseDamage;
        if (!this.target) {
            this.target = TargetingUtils.getInstance().selectRandomPlayerCharacter();
        }
    }

    tooltipText(): string {
        return 'Attacking for ' + this.displayedDamage() + ' damage.  (base damage before modifiers was ' + this.baseDamage + ")";
    }

    displayText(): string {
        return this.displayedDamage().toString();
    }

    displayedDamage(): number {
        return CombatRules.calculateDamage({ baseDamageAmount: this.baseDamage, target: this.target!, sourceCharacter: this.owner, sourceCard: undefined, fromAttack: true }).totalDamage;
    }

    act(): void {
        if (!this.target) {
            throw new Error('Target cannot be null');
        }
        console.log('Attacking ' + this.target.name);
        ActionManager.getInstance().tiltCharacter(this.owner!);

        ActionManager.getInstance().dealDamage({ baseDamageAmount: this.baseDamage, target: this.target, sourceCharacter: this.owner });

    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            damage: this.baseDamage,
        }, null, 2);
    }
}

export class TagCardsIntent extends AbstractIntent {
    buffs: AbstractBuff[];
    numCardsToTag: number;
    pileToTagFrom: 'draw' | 'discard';

    constructor({ buffs, numCardsToTag, pileToTagFrom, owner }: { buffs: AbstractBuff[], numCardsToTag: number, pileToTagFrom: 'draw' | 'discard', owner: BaseCharacter }) {
        super({ imageName: 'tag', target: undefined, owner: owner });
        this.buffs = buffs;
        this.numCardsToTag = numCardsToTag;
        this.pileToTagFrom = pileToTagFrom;
    }

    tooltipText(): string {
        const buffNames = this.buffs.map(buff => buff.getDisplayName()).join(', ');
        return `Tag ${this.numCardsToTag} random card${this.numCardsToTag > 1 ? 's' : ''} in the ${this.pileToTagFrom} pile with ${buffNames}`;
    }

    displayText(): string {
        return `Tag ${this.numCardsToTag}`;
    }

    act(): void {
        console.log(`Tagging ${this.numCardsToTag} cards in the ${this.pileToTagFrom} pile`);
        const gameState = GameState.getInstance();
        const pile = this.pileToTagFrom === 'draw' ? gameState.combatState.drawPile : gameState.combatState.currentDiscardPile;
        
        // Shallow clone the pile to avoid modifying the original
        const clonedPile = [...pile];
        // Shuffle the pile to ensure randomness
        const cardsToTag = TargetingUtils.getInstance().selectRandomCardsFromPile(clonedPile as AbstractCard[], this.numCardsToTag);
        
        console.log(`Tagging ${cardsToTag.length} cards from the ${this.pileToTagFrom} pile`);
        
        for (const card of cardsToTag) {
            for (const buff of this.buffs) {
                ActionManager.getInstance().applyBuffToCard(card as PlayableCard, buff);
            }
        }
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            buffs: this.buffs.map(buff => buff.getDisplayName()),
            numCardsToTag: this.numCardsToTag,
            pileToTagFrom: this.pileToTagFrom,
        }, null, 2);
    }
}


export class AttackAllPlayerCharactersIntent extends AbstractIntent {
    baseDamage: number;

    constructor({ baseDamage, owner }: { baseDamage: number, owner: BaseCharacter }) {
        super({ imageName: 'sword-array', target: undefined, owner: owner });
        this.baseDamage = baseDamage;
        this.iconTint = 0xff0000;
        this.targetsAllPlayers = true;
    }

    tooltipText(): string {
        return `Attacking all allies for ${this.displayedDamage()} damage`;
    }

    displayText(): string {
        return this.displayedDamage().toString();
    }

    displayedDamage(): number {
        const randomTarget = TargetingUtils.getInstance().selectRandomPlayerCharacter();
        return CombatRules.calculateDamage({ baseDamageAmount: this.baseDamage, target: randomTarget, sourceCharacter: this.owner, sourceCard: undefined, fromAttack: true }).totalDamage;
    }

    act(): void {
        console.log('Attacking all allied characters');
        ActionManager.getInstance().tiltCharacter(this.owner!);

        const playerCharacters = TargetingUtils.getInstance().selectAllPlayerCharacters();
        for (const target of playerCharacters) {
            ActionManager.getInstance().dealDamage({ baseDamageAmount: this.baseDamage, target: target, sourceCharacter: this.owner });
        }
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            damage: this.baseDamage,
        }, null, 2);
    }
}

export class ApplyDebuffToAllPlayerCharactersIntent extends AbstractIntent {
    debuff: AbstractBuff;

    constructor({ debuff, owner }: { debuff: AbstractBuff, owner: BaseCharacter }) {
        super({ imageName: 'chemical-bolt', target: undefined, owner: owner });
        this.debuff = debuff;
    }

    tooltipText(): string {
        return `Applying ${this.debuff.getDisplayName()} to a random player`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        for (const target of TargetingUtils.getInstance().selectAllPlayerCharacters()) {
            console.log(`Applying ${this.debuff.stacks} stack(s) of ${this.debuff.getDisplayName()} to ${target.name}`)
            ActionManager.getInstance().tiltCharacter(this.owner!);
            ActionManager.getInstance().applyBuffToCharacterOrCard(target, this.debuff);
        }
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            debuff: this.debuff.getDisplayName(),
            stacks: this.debuff.stacks,
        }, null, 2);
    }
}

export class ApplyBuffToAllEnemyCharactersIntent extends AbstractIntent {
    buff: AbstractBuff;

    constructor({ debuff, owner }: { debuff: AbstractBuff, owner: BaseCharacter }) {
        super({ imageName: 'magic', target: undefined, owner: owner });
        this.buff = debuff;
    }

    tooltipText(): string {
        return `Applying ${this.buff.getDisplayName()} to all your foes.`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        ActionManager.getInstance().tiltCharacter(this.owner!);
        for (const target of TargetingUtils.getInstance().selectAllEnemyCharacters()) {
            console.log(`Applying ${this.buff.stacks} stack(s) of ${this.buff.getDisplayName()} to ${target.name}`)
            ActionManager.getInstance().applyBuffToCharacterOrCard(target, this.buff);
        }
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            debuff: this.buff.getDisplayName(),
            stacks: this.buff.stacks,
        }, null, 2);
    }
}


export class ApplyDebuffToRandomCharacterIntent extends AbstractIntent {
    debuff: AbstractBuff;

    constructor({ debuff, owner }: { debuff: AbstractBuff, owner: BaseCharacter }) {
        super({ imageName: 'poison-bottle-2', target: undefined, owner: owner });
        this.debuff = debuff;
        this.target = TargetingUtils.getInstance().selectRandomPlayerCharacter();
    }

    tooltipText(): string {
        return `Applying ${this.debuff?.getDisplayName()} to a random player`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        if (!this.target) {
            throw new Error('Target cannot be null');
        }
        ActionManager.getInstance().tiltCharacter(this.owner!);

        console.log(`Applying ${this.debuff.stacks} stack(s) of ${this.debuff.getDisplayName()} to ${this.target.name}`);
        ActionManager.getInstance().applyBuffToCharacterOrCard(this.target, this.debuff);
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            debuff: this.debuff.getDisplayName(),
            stacks: this.debuff.stacks,
        }, null, 2);
    }
}

export class BlockForSelfIntent extends AbstractIntent {
    blockAmount: number;

    constructor({ blockAmount, owner }: { blockAmount: number, owner: BaseCharacter }) {
        super({ imageName: 'shield', target: undefined, owner: owner });
        this.blockAmount = blockAmount;
    }

    tooltipText(): string {
        return `Gaining ${this.blockAmount} Block`;
    }

    displayText(): string {
        return `${this.blockAmount}`;
    }

    act(): void {
        ActionManager.getInstance().tiltCharacter(this.owner!);
        console.log(`${this.owner!.name} is gaining ${this.blockAmount} Block`);
        ActionManager.getInstance().applyBlock({ baseBlockValue: this.blockAmount, blockSourceCharacter: this.owner, blockTargetCharacter: this.owner });
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            blockAmount: this.blockAmount,
        }, null, 2);
    }
}


export class ApplyBuffToSelfIntent extends AbstractIntent {
    buff: AbstractBuff;

    constructor({ buff: buff, owner }: { buff: AbstractBuff, owner: BaseCharacter }) {
        super({ imageName: 'magick-trick', target: undefined, owner: owner });
        this.buff = buff;
    }

    tooltipText(): string {
        return `Applying ${this.buff.getDisplayName()} to self`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        ActionManager.getInstance().tiltCharacter(this.owner!);
        console.log(`Applying ${this.buff.stacks} stack(s) of ${this.buff.getDisplayName()} to allies`);
        ActionManager.getInstance().applyBuffToCharacterOrCard(this.owner!, this.buff);
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            debuff: this.buff.getDisplayName(),
            stacks: this.buff.stacks,
        }, null, 2);
    }
}

export class IntentListCreator {
    static selectRandomIntents(intentLists: AbstractIntent[][]): AbstractIntent[] {
        if (intentLists.length === 0) {
            return [];
        }
        const randomIndex = Math.floor(Math.random() * intentLists.length);
        return intentLists[randomIndex];
    }

    static iterateIntents(intentLists: AbstractIntent[][]): AbstractIntent[] {
        if (intentLists.length === 0) {
            return [];
        }
        
        const gameState = GameState.getInstance();
        const currentTurn = gameState.combatState.currentTurn;
        
        const index = currentTurn % intentLists.length;
        return intentLists[index];
    }

    static iterateIntentsWithRepeatingLastElement(intentLists: AbstractIntent[][]): AbstractIntent[] {
        if (intentLists.length === 0) {
            return [];
        }
        
        const gameState = GameState.getInstance();
        const currentTurn = gameState.combatState.currentTurn;
        
        if (currentTurn < intentLists.length) {
            return intentLists[currentTurn];
        } else {
            return intentLists[intentLists.length - 1];
        }
    }
}




export class DoSomethingIntent extends AbstractIntent {
    action: () => void;
    constructor({ owner, action, imageName }: { owner: BaseCharacter, action: () => void, imageName?: string }) {
        super({ imageName: imageName ?? 'uncertainty', target: undefined, owner: owner });
        ActionManager.getInstance().animateAttackerTilt(owner.physicalCard as PhysicalCard);
        this.action = action;
    }

    tooltipText(): string {
        return `This character is gonna do something!`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        this.action();
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
        }, null, 2);
    }
}

import { LocationCard } from "../../maplogic/LocationCard";
import type { AbstractCombatEvent } from "../../rules/AbstractCombatEvent";
import type { DamageInfo } from "../../rules/DamageInfo";
import type { CombatResources, CombatState, GameState, ShopContents } from "../../rules/GameState";
import type { ActionManager } from "../../utils/ActionManager";
import { ActionManagerFetcher } from "../../utils/ActionManagerFetcher";
import type { AbstractCard } from "../AbstractCard";
import { generateWordGuid } from "../AbstractCard";
import { AbstractIntent } from "../AbstractIntent";
import type { BaseCharacter } from "../BaseCharacter";
import { PlayerCharacter } from "../BaseCharacterClass";
import type { IAbstractBuff } from '../IAbstractBuff';
import { IBaseCharacter } from "../IBaseCharacter";
import type { PlayableCard } from "../PlayableCard";
export abstract class AbstractBuff implements IAbstractBuff {

    copy(): this {
        // Create a new instance of the same buff type
        const buffCopy = new (this.constructor as any)();
        
        // Copy over all the basic properties
        buffCopy.imageName = this.imageName;
        buffCopy.stackable = this.stackable;
        buffCopy.stacks = this.stacks;
        buffCopy.secondaryStacks = this.secondaryStacks;
        buffCopy.showSecondaryStacks = this.showSecondaryStacks;
        buffCopy.isDebuff = this.isDebuff;
        buffCopy.canGoNegative = this.canGoNegative;
        buffCopy.moveToMainDescription = this.moveToMainDescription;
        // Generate a new unique ID
        buffCopy.id = generateWordGuid();
        
        return buffCopy;
    }

    public withoutShowingUpInBuffs(): this {
        this.moveToMainDescription = true;
        return this;
    }

    // if this is a "standard" buff that is always on the card, it's added to the main description instead of the tooltip/icon.
    public moveToMainDescription: boolean = false;

    /// used when we want to refer to the buff by a unique name, like when we want to check if a card has a buff.
    public getBuffCanonicalName(): string {
        return this.getDisplayName();
    }

    public getCardOwner(): BaseCharacter | null {
        return this.getOwnerAsPlayableCard()?.owningCharacter ?? null;
    }
    public getCardOwnerName(): string {
        return this.getOwnerAsPlayableCard()?.owningCharacter?.name ?? "(owner)";
    }

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

    constructor(stacks: number = 1) {
        this.imageName = "PLACEHOLDER_IMAGE";
        this.id = generateWordGuid();
        this.stackable = true;
        this.stacks = stacks;
        this.secondaryStacks = -1;
        this.showSecondaryStacks = false;
        this.isDebuff = false;
        this.canGoNegative = false;
    }

    protected forEachAlly(callback: (ally: BaseCharacter) => void): void {
        const playerCharacters = this.gameState.combatState.playerCharacters;
        playerCharacters.forEach(callback);
    }
    protected forEachEnemy(callback: (enemy: BaseCharacter) => void): void {
        const enemies = this.gameState.combatState.enemies;
        enemies.forEach(callback);
    }

    public generateSeededRandomBuffColor(): number {
        let hash = 0;
        for (let i = 0; i < this.getDisplayName().length; i++) {
            const char = this.getDisplayName().charCodeAt(i);
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
        this.actionManager.displaySubtitle(this.getDisplayName(), 500);
    }


    public getOwnerOfCardThisBuffIsAttachedTo(): PlayerCharacter | null {
        return this.getOwnerAsPlayableCard()?.owningCharacter ?? null;
    }

    public getOwnerAsPlayableCard(): PlayableCard | null {
        // Import GameState if not already imported at the top of the file

        // Find the owner of this buff by searching through all characters in the combat state
        const combatState = this.gameState.combatState;
        const allPlayableCards = [...combatState.drawPile, ...combatState.currentHand, ...combatState.currentDiscardPile];
        const owner = allPlayableCards.find(card => card.buffs.some(buff => buff.id === this.id));

        if (!owner) {
            console.warn(`No owner found for buff ${this.getDisplayName()} with id ${this.id}`);
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
            console.warn(`No owner found for buff ${this.getDisplayName()} with id ${this.id}`);
            return null;
        }

        return owner as PlayerCharacter;
    }

    /*
    * Generally you'll want to use the ActionManager method for this since that allows game animations to play.
    */
    public static _applyBuffToCharacterOrCard(character: AbstractCard, buff: AbstractBuff) {
        if (buff == null) {
            console.warn("Attempted to apply null buff to character or card");
            return;
        }

        buff = buff.copy();
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
                console.log(`Buff ${existingBuff.getDisplayName()} is not stackable. Ignoring new application.`);
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
    tint: number = 0xFFFFFF;

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


    abstract getDisplayName(): string;

    /**
     * make sure to use getStacksDisplayText() in the description if you want to show the number of stacks.
     */
    abstract getDescription(): string;


    onActStart(): void {

    }

    onAnyCardDiscarded(card: PlayableCard) {

    }

    public onAnyCardDrawn(card: PlayableCard): void {
        
    }

    onRunStart(): void {

    }

    onCardUpgraded(card: PlayableCard): void {

    }

    onRest(card: PlayableCard): void {

    }
    onAnyCardExhausted(card: PlayableCard) {
    }


    public onClicked(): void {}

    public passivePerTurnEnergyModifier(): number {
        return 0;
    }
    
    public onShopInitialized(shopContents: ShopContents): void {
    }

    energyCostModifier(): number {
        return 0;
    }

    onLocationEntered(location: LocationCard): void {

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

    onTurnEnd() {

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

    hellValueFlatModifier(): number {
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

    public onGainingThisCard(){

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

    public incomingAttackIntentValue(): AbstractIntent[] {
        return [];
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

export class IncomingIntentInformation{
    public comingFrom?: PlayableCard;
    public targetingCharacter: BaseCharacter;
    public amountOfDamage: number;

    constructor(targetingCharacter: BaseCharacter, amountOfDamage: number, comingFrom?: PlayableCard) {
        this.comingFrom = comingFrom;
        this.targetingCharacter = targetingCharacter;
        this.amountOfDamage = amountOfDamage;
    }

    public get id(): string {
        return this.comingFrom?.id + "#" + this.targetingCharacter.id + "#" + this.amountOfDamage;
    }
}

import { AbstractIntent, ApplyBuffToSelfIntent, AttackIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Flying } from '../../../gamecharacters/buffs/standard/Flying';
import { Lethality } from '../../../gamecharacters/buffs/standard/Strong';
import { Terrifying } from '../../../gamecharacters/buffs/standard/Terrifying';

export class FrenchCrow extends AutomatedCharacter {
    constructor() {
        super({
            name: "Crow",
            portraitName: "Eldritch Corruption Crow",
            maxHitpoints: 10,
            description: "A pest that tends to materialize in the wake of the French cults."
        });
        this.buffs.push(new Flying(1));
        this.buffs.push(new Terrifying(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const randomChoice = Math.random();
        
        if (randomChoice < 0.3) {
            return [
                new AttackIntent({ baseDamage: 4, owner: this }).withTitle("Stab"),
                new AttackIntent({ baseDamage: 5, owner: this }).withTitle("Bite")
            ];
        } else if (randomChoice < 0.7) {
            return [new AttackIntent({ baseDamage: 12, owner: this }).withTitle("Void Strike")];
        } else {
            // Buff itself with 2 strength
            return [new ApplyBuffToSelfIntent({ buff: new Lethality(2), owner: this }).withTitle("Eldritch Empowerment")];
        }
    }
}



# Buff Glossary

## Combat Buffs

### Accursed [character]
At the start of combat, apply X Cursed to each player character.

### Badass [character]
At the start of combat, gain X Mettle.

### BloodGod [character]
Whenever a sacrifice happens, gain X Strength.

### Bloodprice [playable_card]
If you lack sufficient energy, pay X health per unpaid energy to play this card.

### Bulwark [character]
Increase block applied by X.

### Burning [character]
At the end of turn, take (4 + Powder) damage for X turns.

### CapitalistSoul [character]
At the start of combat, gain X Venture.

### Courageous [character]
At the start of combat, gain X Fearless.

### Cursed [character]
Negates the next X non-debuff buff(s) applied.

### Damaged [playable_card]
Costs 1 more energy.

### Daring [character]
At the start of combat, gain X Pluck.

### Delicious [character]
When struck, grants X Strength to the attacker.

### DesignatedFoe [character]
Marked as the designated target by a Duelist.

### DespairNexus [character]
At the end of each turn, decrease all resource counts by X.

### Desirous [character]
The first X cards played each turn exhaust.

### Devil [character]
Takes X less damage from attacks.

### DoNotLookAtMe [character]
Whenever targeted by a card, applies X Stress to the owner.

### Duelist [character]
At combat start, marks a random player as the Designated Foe. Takes no damage from characters who are not the Designated Foe.

### EarWorm [playable_card]
Retain. At the end of your turn, deal X damage. Damage increases by 1 each turn this remains in your hand.

### EldritchHorror [character]
Every turn after turn 5, the party gains 1 stress.

### ErodingValue [playable_card]
When played, decrease HellSellValue and SurfaceSellValue by X.

### ExhaustBuff [playable_card]
Exhaust this card when played.

### ExplosiveFinishCardBuff [playable_card]
On Fatal: Applies X Burning to all enemies.

### FearGod [character]
The first X card(s) played each turn gain Phobia.

### Fearless [character]
Absorbs the next X stack(s) of Stress applied.

### Figment [playable_card]
If this card is in hand at the end of turn, exhaust it.

### Flying [character]
Dodges the first X attacks each turn.

### Fragile [playable_card]
When this card is exhausted or actively discarded, destroy it.

### GiantKiller [character]
Increases damage dealt to enemies with Titan by 50% × X.

### GrowingPower [character]
At the beginning of each turn, gain X Strength.

### Guilt [character]
Whenever a card with cost >2 is played, exhaust X card(s) from your discard pile.

### HeavySmoker [character]
At the start of combat, gain X Smog.

### HellSellValue [playable_card]
The sell value of this card in Hell is, at baseline, X in Brimstone Distillate.

### Holy [character]
Deals 50% additional damage to Devils and Eldritch enemies. Deals no damage to Holy enemies.

### Idol [character]
When this character is attacked, ALL enemy intents focus on the attacker.

### IncreaseBlood [playable_card]
When played, gain X Blood.

### IncreaseIron [playable_card]
When played, gain X Mettle.

### IncreasePages [playable_card]
When card is played, gain X Pages. Exhaust.

### IncreasePluck [playable_card]
When played, gain X Pluck.

### IncreaseSmog [playable_card]
When played, gain X Smog.

### IncreaseVenture [playable_card]
When played, gain X Venture.

### Lightweight [playable_card]
When drawn: draw an additional card. Can happen X more times.

### Lumbering [character]
Every time a card is played, takes X additional damage from attacks for the rest of the turn.

### Merchant [character]
At the start of your run, a random piece of cargo in your inventory sells for X more Hell Currency.

### MothGod [character]
At the start of each turn, apply Eggs to X random card(s) in your draw pile.

### Muse [character]
Whenever a cost 0 card is played, gain X Strength.

### NextTurnStrength [character]
At the start of your next turn, gain X Strength.

### Obsession [playable_card]
If this card hasn't been played for X turn(s), move it to your hand at the start of your turn.

### OnSale [playable_card]
X% off! Does not persist after the card is bought.

### Painful [playable_card]
When played, this card deals X damage to you.

### Penance [character]
Whenever you play a card of cost 2 or less, increase its cost by X.

### Poisoned [character]
At the end of turn, lose X HP, then halve the stacks (round down). Creature deals 2 less damage.

### Prepper [character]
At the start of combat, X% chance to gain 1 energy.

### Protective [character]
When dealing block to an ally (who is not the owner of this buff), the ally gains X more block.

### ReactiveShielding [character]
After taking unblocked damage for the first time in a turn, gain X Block.

### Regeneration [character]
Heals X HP at the end of each turn.

### Robotic [character]
Negates all Burning or Poison applied.

### RockSlides [location]
On entry, all allies take X damage.

### RustMonster [character]
When the owner hits a character, if that character has at least one card in the non-exhaust piles, a random card with >0 defense gets -X to defense.

### Sacrifice [playable_card]
Exhaust the rightmost other card in your hand when you play this card.

### Sadist [character]
On killing an enemy, this character relieves X stress.

### Scholar [character]
At the start of combat, gain X Ashes.

### Selfish [character]
This character's cards apply X more block to the owner of this buff and X less block to all other characters.

### SelfDestruct [character]
After Y turns, deals 999 damage to self and X damage to all player characters.

### SoulEater [playable_card]
When acquired, reduces max HP by X.

### Stress [character]
For every 10 Stress stacks, enemies start combat with 1 more Lethality.

### StressReliefFinisher [playable_card]
Whenever this kills an enemy, the whole party heals X stress.

### Stressful [playable_card]
When played, apply X Stress to owner.

### Strong [character]
Increases damage by X.

### StrongBack [character]
At the start of combat, apply X Light to a random piece of cargo in your draw pile.

### SurfaceSellValue [playable_card]
Increases the Surface value of this card by X.

### Swarm [character]
Caps the amount of damage received from an attack to X.

### TemporaryStrength [character]
Increases damage by X until end of turn.

### Tense [character]
Each turn, if your stress is less than X, increase it to X.

### Terrifying [character]
Applies X additional Stress whenever it successfully damages someone.

### Titan [character]
Decreases all incoming attack damage by X.

### TougherEnemies [location]
All enemies have 40% more max HP.

### Undersider [character]
At the start of your run, gain X Hell Currency.

### ValuableCargo [playable_card]
This card is valuable cargo. It will be purged if it loses all its value.

### Volatile [playable_card]
When this card is discarded, play it instead and exhaust a random card in hand.

### Vulnerable [character]
Increases damage taken by 50% for X turn(s).

### Ward [character]
Negates the next X debuff(s) applied.

### Weak [character]
Reduces damage dealt by 33% for X turn(s).

### WellDrilled [character]
Revolver attacks played by this character deal X additional damage.

## Notes
- X represents the number of stacks a buff has
- Some buffs may have additional mechanics not fully detailed here
- Buffs marked with [Powder] scale with the Powder combat resource

### BloodGod [playable_card, character]
Whenever a sacrifice happens, this card/character gains X Lethality.

### Bloodprice [playable_card]
If you lack sufficient energy, pay X health per unpaid energy to play this card.

### Bulwark [playable_card, character]
Increase block applied by X.  (Analogous to STS's dexterity.)

### Burning [character]
At the end of turn, take (4 + Powder) damage for X turns.

### Courageous [characer]
At the start of combat, gain X Fearless.

### Cursed [playable_card, character]
Negates the next X non-debuff buff(s) applied.

### DamageIncreaseOnKill [playable_card]
When this card kills an enemy, its damage increases by X permanently.

### Delicious [character]
When struck, grants X Strength to the attacker.

### DespairNexus [character]
At the end of each turn, decrease all resource counts by X.

### Desirous [character]
The first X cards played each turn exhaust.

### Devil [character]
Takes X less damage from attacks.

### DoNotLookAtMe [character]
Whenever targeted by a card, applies X Stress to the owner.

### EarWorm [playable_card]
Retain. At the end of your turn, owner takes X damage. Damage increases by 1 each turn this remains in your hand.

### Eldritch [character]
Every turn after turn 5, the party gains 1 stress.

### ExhaustBuff [playable_card]
Exhaust this card when played.

### FearGod [character]
The first X card(s) played each turn gain Phobia.

### Fearless [character]
Absorbs the next X stack(s) of Stress applied.

### Flying [character]
Dodges the first X attacks each turn.

### GiantKiller [playable_card, character]
Increases damage dealt to enemies with Titan by 10% × X.

### GrowingPower [character, playable_card]
At the beginning of each turn, gain X Strength.

### Guilt [character]
Whenever a card with cost >2 is played, exhaust X card(s) from your discard pile.

### HellSellValue [playable_card]
Increases the Hell value of this card by X.

### Holy [playable_card, character]
Deals 50% additional damage to Devils and Eldritch enemies. Deals no damage to Holy enemies.

### Idol [character]
When this character is attacked, ALL enemy intents focus on the attacker.

### Lumbering [character]
Every time a card is played, takes X additional damage from attacks for the rest of the turn.

### MothGod [character]
At the start of each turn, apply Eggs to X random card(s) in your draw pile.

### Muse [character]
Whenever a cost 0 card is played, gain X Strength.

### NextTurnStrength [character]
At the start of your next turn, gain X Strength.

### Obsession [playable_card]
If this card hasn't been played for X turn(s), move it to your hand at the start of your turn.

### Painful [playable_card]
When played, this card deals X damage to you.

### Penance [character]
Whenever you play a card of cost 2 or less, increase its cost by X.

### Poison [character]
At the end of turn, lose X HP, then multiple poison stacks by 1/3. Creature deals 2 less damage.

### Prepper [character]
At the start of combat, X% chance to gain 1 energy.

### Protective [character]
When dealing block to an ally (who is not the owner of this buff), the ally gains X more block.

### ReactiveShielding [character]
After taking unblocked damage for the first time in a turn, gain X Block.

### Regeneration [character]
Heals X HP at the end of each turn.

### Robotic [character]
Negates all Burning or Poison applied.

### RustMonster [character]
When the owner hits a character, if that character has at least one card in the non-exhaust piles, a random card with >0 defense gets -X to defense.

### Sadist [character]
On killing an enemy, this character relieves X stress.

### Selfish [character]
This character's cards apply X more block to the owner of this buff and X less block to all other characters.

### SelfDestruct [character]
After Y turns, deals 999 damage to self and X damage to all player characters.

### Stress [character]
PLAYER-ONLY MECHANIC.  Stress does not go away at end of combat.  When the character has >= 10 stress, they take double damage from attacks.

### StressReliefFinisher [playable_card]
Whenever this kills an enemy, the whole party heals X stress.

### Stressful [playable_card]
Applies X additional Stress whenever it successfully damages someone.

### Strong [playable_card, character]
Increases damage by X.

### SurfaceSellValue [playable_card]
Increases the Surface value of this card by X.

### Swarm [character]
Caps the amount of damage received from an attack to X.

### Tense [character]
Each turn, if your stress is less than X, increase it to X.

### Titan [character]
Decreases all incoming damage by X.

### ValuableCargo [playable_card]
This card is valuable cargo. It will be purged if it loses all its value.

### Volatile [playable_card]
When this card is discarded, play it instead and exhaust a random card in hand.

### Vulnerable [character]
Increases damage taken by 50% for X turn(s).

### Weak [character, playable_card]
Reduces damage dealt by 33% for X turn(s).

## Notes
- X represents the number of stacks a buff has
- Some buffs may have additional mechanics not fully detailed here
- Buffs marked with [Powder] scale with the Powder combat resource


# RESOURCES NOTES
Resources are present in each combat. In general, resources can be either gained or used as a scaler by a card but never both. (Damage, block, and magic numbers are the types of resource scaling.) "Relevant classes" refers to classes that can gain the resource from cards, but any class can use any resource as a scaler.

# TYPES OF RESOURCES

## Blood (Powder)
At the start of turn, if you have 2 Blood, decrease it by 2 and a random ally gains 2 strength.
RELEVANT CLASS: Blackhand, Archon

## Mettle (Iron)
At beginning of turn, gain 1 block for each Mettle value. Decreases by 1 at end of turn.
RELEVANT CLASS: Blackhand, Archon

## Ashes (Pages)
If you obtain 4 Ashes in a combat, gain an additional card reward option. If you gain 10, get 2 instead.
RELEVANT CLASS: Cog, Diabolist

## Pluck
Grants additional effects to certain cards based on Pluck value.
RELEVANT CLASS: Scavenger, Diabolist

## Smog
At the start of turn, if you have more than 4 Smog, gain a special effect defined by the character.
RELEVANT CLASS: Scavenger, Cog

## Venture
At end of combat, gain a loot reward option for each 2 Venture value. [This is distinct from ordinary card rewards]
RELEVANT CLASS: Scavenger


# CARD KEYWORDED MECHANICS
These can go on any card.  You may have buffs that key off of these mechanics: e.g. "whenever you exert", or "whenever you manufacture".

## Barrage
Select up to 10 cards to discard.  For each card discarded, performs some action defined by the card.

## Sacrifice
Exhaust the rightmost card in your hand.

## Exert X
If you have enough energy after playing the card, expends X and triggers an effect defined by the card.

## Manufacture
Creates a card in your hand.

## Taunt
Forces an enemy to redirect current intents to the card's owner.

## Once
Denotes an effect that can only happen once per combat.

## Once Per Turn
Denotes an effect that can only happen once per turn.


Remember, when you're creating a new enemy, you can use the buffs_glossary.md file to see what buffs are available, and you're also allowed to create your own buffs.


# FLAVOR

This game takes place in a nightmare dimension where the british are sending a trade caravan.  The creatures you create should be very very weird.  Weirder than that.