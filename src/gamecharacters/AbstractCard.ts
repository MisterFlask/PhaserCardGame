import { Scene } from 'phaser';
import { AbstractEvent } from '../events/AbstractEvent';
import type { GameState } from '../rules/GameState';
import { BattleCardLocation } from '../rules/GameState';
import type { PhysicalCard } from '../ui/PhysicalCard';
import { ShadowedImage } from '../ui/ShadowedImage';
import { TextBox } from '../ui/TextBox';
import type { ActionManager } from '../utils/ActionManager';
import { ActionManagerFetcher } from '../utils/ActionManagerFetcher';

import ImageUtils from '../utils/ImageUtils';
import { AbstractPeriodicBark } from './AbstractPeriodicBark';
import type { BaseCharacter } from './BaseCharacter';
import { AbstractBuff } from './buffs/AbstractBuff';
import { IAbstractCard } from './IAbstractCard';
import type { PlayableCard } from './PlayableCard';
import type { PlayerCharacter } from './PlayerCharacter';
import { CardSize, CardType } from './Primitives'; // Ensure enums are imported from Primitives

export interface IPhysicalCardInterface {
    container: Phaser.GameObjects.Container;
    cardBackground: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
    cardImage: ShadowedImage;
    data: AbstractCard;
    blockText: TextBox;

    setInteractive(isInteractive: boolean): void;
}

const wordList = [
    "apple", "banana", "cherry", "date", "elderberry",
    "fig", "grape", "honeydew", "kiwi", "lemon",
    "mango", "nectarine", "orange", "papaya", "quince",
    "raspberry", "strawberry", "tangerine", "ugli", "vanilla",
    "watermelon", "xigua", "yuzu", "zucchini", "apricot",
    "blackberry", "coconut", "dragonfruit", "eggplant", "feijoa",
    "guava", "huckleberry", "imbe", "jackfruit", "kumquat",
    "lime", "mulberry", "nance", "olive", "peach",
    "rambutan", "soursop", "tamarind", "ugni", "voavanga",
    "wolfberry", "ximenia", "yam", "zapote", "acai",
    "boysenberry", "cantaloupe", "durian", "elderflower", "farkleberry",
    "gooseberry", "horned melon", "ilama", "jujube", "keppel",
    "longan", "miracle fruit", "noni", "persimmon", "quandong",
    "redcurrant", "salak", "tomato", "uva ursi", "velvet apple",
    "wampee", "xoconostle", "yangmei", "ziziphus", "ackee",
    "bilberry", "cherimoya", "damson", "entawak", "finger lime",
    "gac", "hawthorn", "ice cream bean", "jabuticaba", "kiwano",
    "lucuma", "mamey", "nance", "opuntia", "pawpaw",
    "rhubarb", "soncoya", "tomatillo", "uvaia", "vanilla bean",
    "whisper", "shadow", "breeze", "echo", "twilight",
    "mist", "ember", "frost", "ripple", "dusk",
    "glow", "haze", "shimmer", "spark", "zephyr",
    "aurora", "nebula", "cosmos", "zenith", "abyss",
    "cascade", "tempest", "vortex", "mirage", "prism",
    "labyrinth", "enigma", "paradox", "quasar", "nexus",
    "cipher", "phantom", "specter", "wraith", "reverie",
    "serenity", "euphoria", "melancholy", "epiphany", "solitude",
    "eternity", "infinity", "oblivion", "destiny", "harmony",
    "symphony", "rhapsody", "sonata", "lullaby", "serenade",
    "quixotic", "ephemeral", "serendipity", "mellifluous", "effervescent",
    "luminous", "ethereal", "gossamer", "petrichor", "halcyon",
    "nebulous", "ineffable", "eloquent", "enigmatic", "euphoria",
    "epiphany", "quintessential", "melancholy", "ethereal", "labyrinthine",
    "ephemeral", "cacophony", "surreptitious", "ebullient", "clandestine",
    "effulgent", "mercurial", "ephemeral", "sonorous", "ethereal",
    "incandescent", "mellifluous", "ephemeral", "serendipitous", "effervescent",
    "luminescent", "ethereal", "iridescent", "ephemeral", "mellifluous",
    "nebulous", "ineffable", "eloquent", "enigmatic", "euphoric",
    "epiphanic", "quintessential", "melancholic", "ethereal", "labyrinthine",
];

export function generateWordGuid(baseId: string = ""): string {

    const seedNumber = Math.floor(Math.random() * 0xFFFFFFFF);
    const randomIndex1 = Math.floor(Math.random() * wordList.length);
    const randomIndex2 = Math.floor(Math.random() * wordList.length);
    const randomIndex3 = Math.floor(Math.random() * wordList.length);

    const word1 = wordList[randomIndex1];
    const word2 = wordList[randomIndex2];
    const word3 = wordList[randomIndex3];
    
    if (baseId === ""){
        return `${word1} ${word2} ${word3} ${seedNumber}`;
    }
    return `${baseId} ${word1} ${word2}`;
}

export enum Team{
    ALLY,
    ENEMY
}
    // Enum to represent pricing context
export enum PriceContext {
    SURFACE_BUY,
    SURFACE_SELL,
    HELL_BUY,
    HELL_SELL,
    NONE
}

export abstract class AbstractCard implements IAbstractCard {
    isPlayerCharacter(): boolean {
        return this.hasOwnProperty("characterClass");
    }

    tags: string[] = [];

    wasManufactured(): boolean {
        return this.tags.includes("manufactured");
    }

    asPlayerCharacter() : PlayerCharacter | null {
        if (this.isPlayerCharacter()) {
            return this as unknown as PlayerCharacter;
        }
        return null;
    }
    
    public getPile() : BattleCardLocation {
        return ActionManagerFetcher.getGameState().combatState.getBattleCardLocation(this.id);
    }
    public transientUiFlag_disableStandardDiscardAfterPlay: boolean = false;

    public typeTag: string = "AbstractCard"
    
    public portraitTargetLargestDimension?: number
    public portraitOffsetXOverride?: number
    public portraitOffsetYOverride?: number 
    
    public isSelected: boolean = false;

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get description(): string {
        return this._description;
    }

    public set description(value: string) {
        this._description = value;
    }

    public isBaseCharacter(): boolean{
        return this.hasOwnProperty('hitpoints');
    }

    public isAutomatedCharacter(): boolean{
        return this.hasOwnProperty('intents');
    }

    public isPlayableCard(): boolean{
        return this.hasOwnProperty('targetingType');
    }

    public asPlayableCard(): PlayableCard{
        return this as unknown as PlayableCard;
    }

    public asBaseCharacter(): BaseCharacter{
        return this as unknown as BaseCharacter;
    }

    public _actionManager!: ActionManager;

    public get gameState(): GameState{
        return ActionManagerFetcher.getGameState();
    }

    public get actionManager(): ActionManager{
        return ActionManagerFetcher.getActionManager();
    }

    public baseEnergyCost: number = 0;
    protected _name: string;
    protected _description: string;
    public flavorText: string = "";
    public portraitName?: string

    public additionalPortraitLayerNames: string[] = [];

    cardType: CardType
    public tooltip: string
    owningCharacter?: PlayerCharacter
    size: CardSize
    id: string
    physicalCard?: PhysicalCard // this is a hack, it's just always PhysicalCard
    team: Team
    block: number = 0
    buffs: AbstractBuff[] = [];
    portraitTint?: number
    backgroundImageNameOverride?: string

    applyBuffs_useFromActionManager(buffs: AbstractBuff[]): void {
        buffs.forEach(buff => AbstractBuff._applyBuffToCharacterOrCard(this, buff));
    }

    public surfacePurchaseValue: number = -1;
    public hellPurchaseValue: number = -1;
    public get finalHellSellValue(): number {
        const baseValue = this.getBuffStacks("HELL_SELL_VALUE");
        const currentLocation = ActionManagerFetcher.getGameState().getCurrentLocation();
        if (!currentLocation) return baseValue;

        // Get merchant multiplier from location buffs if it exists
        const merchantMultiplier = currentLocation.buffs.find(buff => buff.id === "MerchantMultiplier");
        if (!merchantMultiplier) return baseValue;

        // Apply the percentage increase
        return Math.floor(baseValue * (1 + merchantMultiplier.stacks / 100));
    }
    public get surfaceSellValue(): number {
        return this.getBuffStacks("Surface Sell Value")
    }
    // Method to get the appropriate price based on context
    public getPriceForContext(context: PriceContext): number {
        switch (context) {
            case PriceContext.SURFACE_BUY: 
                return this.surfacePurchaseValue;
            case PriceContext.SURFACE_SELL: 
                return this.surfaceSellValue;
            case PriceContext.HELL_BUY: 
                return this.hellPurchaseValue;
            case PriceContext.HELL_SELL: 
                // Calculate sell value dynamically
                return this.finalHellSellValue;
            default: 
                return -1;
        }
    }

    // Generates a price display text
    public getPriceDisplayText(context: PriceContext): string {
        const price = this.getPriceForContext(context);
        if (price <= 0) return '';

        switch (context) {
            case PriceContext.SURFACE_BUY: return `${price} 💷`;
            case PriceContext.SURFACE_SELL: return `${price} 💷`;
            case PriceContext.HELL_BUY: return `${price} 🔥`;
            case PriceContext.HELL_SELL: return `Sell: ${price}`;
            default: return '';
        }
    }

    // Color for price display based on context
    public getPriceDisplayColor(context: PriceContext): number {
        switch (context) {
            case PriceContext.SURFACE_BUY:
            case PriceContext.HELL_BUY:
                return 0x696969; // Dark grey for buying
            case PriceContext.SURFACE_SELL:
            case PriceContext.HELL_SELL:
                return 0xffff00; // Yellow for selling
            default:
                return 0xffffff; // White as default
        }
    }

    constructor({ name, description, portraitName, cardType, tooltip, characterData, size, team, tint }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string, characterData?: AbstractCard, size?: CardSize, team?: Team, tint?: number }) {
        this._name = name
        this.id = generateWordGuid(name)
        this._description = description
        this.portraitName = portraitName
        this.cardType = cardType || CardType.SKILL
        this.tooltip = tooltip || "Lorem ipsum dolor sit amet"
        this.owningCharacter = characterData as unknown as PlayerCharacter || undefined
        this.size = size || CardSize.SMALL
        this.team = team || Team.ENEMY
        this.portraitTint = tint || 0xFFFFFF
    }

    mirrorChangeToCanonicalCard(changeFunction: (card: this) => void): void {
        const canonicalCard = this.getCanonicalCard();
        if (canonicalCard) {
            changeFunction(canonicalCard);
            console.log(`Changed canonical card ${canonicalCard.id} to match ${this.id}`);
        }else{
            console.warn(`No canonical card found for ${this.id}`);
        }
        changeFunction(this)
    }
    
    getCanonicalCard(): this | null{
        // check for card in character deck
        const character = this.owningCharacter as PlayerCharacter;
        if (character == null) return null;
        const deck = character.cardsInMasterDeck;
        const canonicalCard = deck.find((card: AbstractCard) => card.id === this.id);
        if (canonicalCard) {
            return canonicalCard as any as this;
        }
        // check for card in inventory
        const inventory = ActionManagerFetcher.getGameState().masterDeckAllCharacters;
        const canonicalCardInInventory = inventory.find((card: AbstractCard) => card.id === this.id);
        if (canonicalCardInInventory) {
            return canonicalCardInInventory as any as this;
        }

        return null;
    }

    getBuffStacks(buffName: string): number {
        const buff = this.buffs.find(buff => buff.getBuffCanonicalName() === buffName);
        return buff ? buff.stacks : 0;
    }

    OnCombatStart(): void {
        console.log('Combat started');
    }
    
    Copy(): this {
        const copy = Object.create(Object.getPrototypeOf(this));
         
        Object.assign(copy, this);
        copy.id = generateWordGuid();
        copy.owner = this.owningCharacter;
        // Deep copy the buffs array
        copy.buffs = this.buffs.map(buff => buff.clone());
        copy.tags = this.tags.slice();
        return copy;
    }

    hasBuff(buffName: string): boolean {
        return this.buffs.some(buff => buff.getDisplayName() === buffName);
    }
    
    createJsonRepresentation(): string {
        return JSON.stringify({
            className: this.constructor.name,
            id: this.id,
            name: this.name,
            description: this.description,
            portraitName: this.portraitName,
            size: this.size,
            cardType: this.cardType,
            tooltip: this.tooltip,
            owner: this.owningCharacter?.name,
            team: this.team,
            block: this.block,
        }, null, 2);
    }

    public getEffectivePortraitName(scene: Scene): string {
        if (this.portraitName && scene.textures.exists(this.portraitName)) {
            return this.portraitName;
        }
        return ImageUtils.getDeterministicAbstractPlaceholder(this.constructor.name);
    }

    public getEffectivePortraitTint(scene: Scene): number {
        if (this.portraitName && scene.textures.exists(this.portraitName)) {
            return this.portraitTint ?? 0xFFFFFF;
        }
        
        // Generate deterministic tint based on constructor name
        const seed = this.constructor.name;
        return this.generateSeededRandomColor(seed);
    }

    private generateSeededRandomColor(seed: string): number {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        const r = (hash & 255);
        const g = ((hash >> 8) & 255);
        const b = ((hash >> 16) & 255);

        return (r << 16) | (g << 8) | b;
    }

    public getCardBackgroundImageName(): string {
        // if card is a BaseCharacter, check if it has a class.  If it does use the class's cardBackgroundImageName.  Otherwise, if the card has an owner, use the owner's class's cardBackgroundImageName.  Otherwise, use the default "greyscale"
        
        if (this.backgroundImageNameOverride){
            return this.backgroundImageNameOverride;
        }

        if ((this as unknown as PlayerCharacter)?.characterClass) {
            return (this as unknown as PlayerCharacter)!.characterClass.cardBackgroundImageName;
        } else if ((this as unknown as PlayableCard)?.owningCharacter) {
            return (this as unknown as PlayableCard)!.owningCharacter!.characterClass!.cardBackgroundImageName;
        }
        return "greyscale";
    }

    public isValidTarget(target: IAbstractCard): boolean {
        // Base cards aren't playable on targets
        if (!(this as unknown as PlayableCard)?.targetingType) return false;

        const targetingType = (this as unknown as PlayableCard).targetingType;
        
        if (targetingType === TargetingType.NO_TARGETING) return true;

        // If target is a character
        if ((target as any).isBaseCharacter?.()) {
            if (targetingType === TargetingType.ENEMY) {
                return target.team === Team.ENEMY;
            } else if (targetingType === TargetingType.ALLY) {
                return target.team === Team.ALLY;
            }
        }
        return false;
    }


    onClickLaunchEvent(): AbstractEvent | null {
        return null;
    }

    getPeriodicBark(): AbstractPeriodicBark | null {
        return null;
    }
}

// dummy card implementation for ui elements that look like cards but are not playable
export class UiCard extends AbstractCard{

    constructor({ name, description, portraitName, cardType, tooltip, size, tint }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string, size?: CardSize , tint?: number}) {
        super({ name:name, description:description, portraitName:portraitName, cardType:cardType, tooltip:tooltip, size:size , tint: tint});
    }
}

export enum TargetingType{
    ALLY = "ALLY",
    ENEMY = "ENEMY",
    NO_TARGETING = "NO_TARGETING",
}
