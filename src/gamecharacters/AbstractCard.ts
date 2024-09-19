import { JsonRepresentable } from '../interfaces/JsonRepresentable';
import { GameState } from '../rules/GameState';
import { AbstractBuff } from '../ui/PhysicalBuff';
import { BaseCharacter } from './BaseCharacter';
import { CardSize, CardType } from './Primitives'; // Ensure enums are imported from Primitives

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

export function generateWordGuid(): string {
    const seedNumber = Math.floor(Math.random() * 0xFFFFFFFF);
    const randomIndex1 = Math.floor(Math.random() * wordList.length);
    const randomIndex2 = Math.floor(Math.random() * wordList.length);
    const randomIndex3 = Math.floor(Math.random() * wordList.length);

    const word1 = wordList[randomIndex1];
    const word2 = wordList[randomIndex2];
    const word3 = wordList[randomIndex3];
    
    return `${word1} ${word2} ${word3} ${seedNumber}`;
}

export enum Team{
    ALLY,
    ENEMY
}

export abstract class AbstractCard implements JsonRepresentable {
    public name: string
    public description: string
    public portraitName: string
    cardType: CardType
    public tooltip: string
    owner?: AbstractCard
    size: CardSize
    id: string = generateWordGuid()
    physicalCard?: IPhysicalCardInterface // this is a hack, it's just always PhysicalCard
    team: Team
    block: number = 0
    buffs: AbstractBuff[] = [];
    energyCost: number = 1

    constructor({ name, description, portraitName, cardType, tooltip, characterData, size, team }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string, characterData?: AbstractCard, size?: CardSize, team?: Team }) {
        this.name = name
        this.description = description
        this.portraitName = portraitName || "flamer1"
        this.cardType = cardType || CardType.PLAYABLE
        this.tooltip = tooltip || "Lorem ipsum dolor sit amet"
        this.owner = characterData || undefined
        this.size = size || CardSize.SMALL
        this.team = team || Team.ENEMY
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
            block: this.block
        }, null, 2);
    }
}

// dummy card implementation for ui elements that look like cards but are not playable
export class UiCard extends AbstractCard{

    constructor({ name, description, portraitName, cardType, tooltip, size }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string, size?: CardSize }) {
        super({ name:name, description:description, portraitName:portraitName, cardType:cardType, tooltip:tooltip, size:size });
    }
}

export abstract class PlayableCard extends AbstractCard {
    targetingType: TargetingType
    constructor({ name, description, portraitName, cardType, tooltip, characterData, size, targetingType, owner }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string, characterData?: AbstractCard, size?: CardSize, targetingType?: TargetingType, owner?: BaseCharacter }) {
        super({ name, description, portraitName, cardType, tooltip, characterData, size });
        this.targetingType = targetingType || TargetingType.ENEMY;
        this.owner = owner;
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

export enum TargetingType{
    ALLY,
    ENEMY,
    NO_TARGETING
}