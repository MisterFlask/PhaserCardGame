import { CardType, CardSize } from "./Primitives";


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

function generateWordGuid(): string {
    const seedNumber = Math.floor(Math.random() * 0xFFFFFFFF);
    const randomIndex1 = Math.floor(Math.random() * wordList.length);
    const randomIndex2 = Math.floor(Math.random() * wordList.length);
    const randomIndex3 = Math.floor(Math.random() * wordList.length);

    const word1 = wordList[randomIndex1];
    const word2 = wordList[randomIndex2];
    const word3 = wordList[randomIndex3];
    
    return `${word1} ${word2} ${word3} ${seedNumber}`;
}

export class AbstractCard {
    
    public name: string
    public description: string
    public portraitName: string
    cardType: CardType
    public tooltip: string
    characterData?: AbstractCard
    size: CardSize
    id: string = generateWordGuid()
    physicalCard: IPhysicalCardInterface | null = null // this is a hack, it's just always PhysicalCard

    constructor({ name, description, portraitName, cardType, tooltip, characterData, size }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string, characterData?: AbstractCard, size?: CardSize }) {
        this.name = name
        this.description = description
        this.portraitName = portraitName || "flamer1"
        this.cardType = cardType || CardType.PLAYABLE
        this.tooltip = tooltip || "Lorem ipsum dolor sit amet"
        this.characterData = characterData || undefined
        this.size = size || CardSize.SMALL
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
}

export abstract class PlayableCard extends AbstractCard {
    constructor({ name, description, portraitName, cardType, tooltip, characterData, size }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string, characterData?: AbstractCard, size?: CardSize }) {
        super({ name, description, portraitName, cardType, tooltip, characterData, size });
    }

    abstract InvokeCardEffects: (targetCard?: AbstractCard) => void;
    abstract IsPerformableOn(targetCard: AbstractCard): boolean;
}