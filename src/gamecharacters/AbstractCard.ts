import { IAbstractCard } from './IAbstractCard';
import { JsonRepresentable } from '../interfaces/JsonRepresentable';
import {  GameState } from '../rules/GameState';
import { AbstractIntent } from './AbstractIntent'; // Import AbstractIntent
import { AbstractBuff } from './buffs/AbstractBuff';
import { CardSize, CardType } from './Primitives'; // Ensure enums are imported from Primitives
import { IBaseCharacter } from './IBaseCharacter';
import { ActionManager } from '../utils/ActionManager';
import { BaseCharacter } from './BaseCharacter';

export interface IPhysicalCardInterface {
    container: Phaser.GameObjects.Container;
    cardBackground: Phaser.GameObjects.Image;
    cardImage: Phaser.GameObjects.Image;
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

export abstract class AbstractCard implements IAbstractCard {
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

    protected _name: string;
    protected _description: string;
    public portraitName: string
    cardType: CardType
    public tooltip: string
    owner?: IBaseCharacter
    size: CardSize
    id: string
    physicalCard?: IPhysicalCardInterface // this is a hack, it's just always PhysicalCard
    team: Team
    block: number = 0
    buffs: AbstractBuff[] = [];
    energyCost: number = 1

    constructor({ name, description, portraitName, cardType, tooltip, characterData, size, team }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string, characterData?: AbstractCard, size?: CardSize, team?: Team }) {
        this._name = name
        this.id = generateWordGuid(name)
        this._description = description
        this.portraitName = portraitName || "placeholder"
        this.cardType = cardType || CardType.SKILL
        this.tooltip = tooltip || "Lorem ipsum dolor sit amet"
        this.owner = characterData as unknown as IBaseCharacter || undefined
        this.size = size || CardSize.SMALL
        this.team = team || Team.ENEMY
    }

    getBuffStacks(buffName: string): number {
        const buff = this.buffs.find(buff => buff.getName() === buffName);
        return buff ? buff.stacks : 0;
    }

    OnCombatStart(): void {
        console.log('Combat started');
    }
    
    Copy(): AbstractCard {
        const copy = Object.create(Object.getPrototypeOf(this));
         
        Object.assign(copy, this);
        copy.id = generateWordGuid();
        return copy;
    }

    addBuffs(buffs: AbstractBuff[]): void {
        buffs.forEach(buff => {
            ActionManager.getInstance().applyBuffToCharacter(this.owner as BaseCharacter, buff);
        }); 
    }
    addBuff(buff: AbstractBuff): void {
        ActionManager.getInstance().applyBuffToCharacter(this.owner as BaseCharacter, buff);
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
            owner: this.owner?.name,
            team: this.team,
            block: this.block,
        }, null, 2);
    }
}

// dummy card implementation for ui elements that look like cards but are not playable
export class UiCard extends AbstractCard{

    constructor({ name, description, portraitName, cardType, tooltip, size }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string, size?: CardSize }) {
        super({ name:name, description:description, portraitName:portraitName, cardType:cardType, tooltip:tooltip, size:size });
    }
}

export enum TargetingType{
    ALLY,
    ENEMY,
    NO_TARGETING
}

export enum PlayableCardType {
    Attack = "Attack",
    Skill = "Skill",
    Power = "Power",
}

