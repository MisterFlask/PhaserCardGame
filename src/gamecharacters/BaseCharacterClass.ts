import { Gender } from "./BaseCharacter";
import { PlayableCard } from "./PlayableCard";

export abstract class BaseCharacterClass {
    constructor({ name, iconName, startingMaxHp, id }: { name: string; iconName: string, startingMaxHp: number, id: string }) {
        this.name = name
        this.iconName = iconName
        this.availableCards = []
        this.id = id
        this.startingMaxHp = startingMaxHp
    }
    
    id: string;
    name: string
    iconName: string
    availableCards: PlayableCard[]
    cardBackgroundImageName: string = "greyscale"
    startingMaxHp: number
    longDescription: string = ""

    abstract getPortraitNameAtRandom(gender: Gender): string;

    initialize() {
        this.availableCards.forEach(card => card.nativeToCharacterClass = this)
    }

    public getUniqueStartingCards(): PlayableCard[] {
        return []
    }

    addCard(card: PlayableCard) {
        this.availableCards.push(card);
    }
}

