
export interface CardData {
    name: string;
    description: string;
    cardType: CardType;
    portraitName: string;
    tooltip: string;
    Action: (targetCard: PhysicalCard) => void;
    IsPerformableOn: (targetCard: PhysicalCard) => boolean;
}

export enum CardLocation {
    BATTLEFIELD,
    HAND,
    CHARACTER_ROSTER
}

export enum CardType{
    CHARACTER = "CHARACTER",
    PLAYABLE = "PLAYABLE"
}

export class AbstractCard implements CardData {
    name: string
    description: string
    portraitName: string
    cardType: CardType
    tooltip: string

    
    constructor({ name, description, portraitName, cardType, tooltip}: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string }) {
        this.name = name
        this.description = description
        this.portraitName = portraitName || "flamer1"
        this.cardType = cardType || CardType.PLAYABLE
        this.tooltip = tooltip || "Lorem ipsum dolor sit amet"
    }

    IsPerformableOn(targetCard: PhysicalCard) {
        if (this.cardType == CardType.PLAYABLE){
            return false
        }
        return true
    }

    Action(targetCard: PhysicalCard) {
        console.log("Action performed on " + targetCard.data.name + " by  "+ this.name)
    }
}

export class PhysicalCard {
    container: Phaser.GameObjects.Container;
    cardBackground: Phaser.GameObjects.Image;
    cardImage: Phaser.GameObjects.Image;
    nameBackground: Phaser.GameObjects.Rectangle;
    nameText: Phaser.GameObjects.Text;
    descText: Phaser.GameObjects.Text;
    descBackground: Phaser.GameObjects.Rectangle;
    tooltipBackground: Phaser.GameObjects.Rectangle;
    tooltipText: Phaser.GameObjects.Text;
    data: CardData;
    cardLocation: CardLocation;

    constructor({
        container,
        cardBackground,
        cardImage,
        nameBackground,
        nameText,
        descText,
        tooltipBackground,
        tooltipText,
        descBackground,
        data,
        cardLocation
    }: {
        container: Phaser.GameObjects.Container;
        cardBackground: Phaser.GameObjects.Image;
        cardImage: Phaser.GameObjects.Image;
        nameBackground: Phaser.GameObjects.Rectangle;
        nameText: Phaser.GameObjects.Text;
        descText: Phaser.GameObjects.Text;
        tooltipBackground: Phaser.GameObjects.Rectangle;
        tooltipText: Phaser.GameObjects.Text;
        descBackground: Phaser.GameObjects.Rectangle;
        data: CardData;
        cardLocation: CardLocation;
    }) {
        this.container = container;
        this.cardBackground = cardBackground;
        this.cardImage = cardImage;
        this.nameBackground = nameBackground;
        this.nameText = nameText;
        this.descText = descText;
        this.descBackground = descBackground;
        this.tooltipBackground = tooltipBackground;
        this.tooltipText = tooltipText;
        this.data = data;
        this.cardLocation = cardLocation;
    }
}