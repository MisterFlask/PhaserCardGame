
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

export enum CardType {
    CHARACTER = "CHARACTER",
    PLAYABLE = "PLAYABLE"
}

export class AbstractCard implements CardData {
    name: string
    description: string
    portraitName: string
    cardType: CardType
    tooltip: string


    constructor({ name, description, portraitName, cardType, tooltip }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string }) {
        this.name = name
        this.description = description
        this.portraitName = portraitName || "flamer1"
        this.cardType = cardType || CardType.PLAYABLE
        this.tooltip = tooltip || "Lorem ipsum dolor sit amet"
    }

    IsPerformableOn(targetCard: PhysicalCard) {
        if (this.cardType == CardType.PLAYABLE) {
            return false
        }
        return true
    }

    Action(targetCard: PhysicalCard) {
        console.log("Action performed on " + targetCard.data.name + " by  " + this.name)
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
    data: AbstractCard;
    cardLocation: CardLocation;
    visualTags: PhysicalCardVisualTag[];
    scene: Phaser.Scene;

    constructor({
        scene,
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
        cardLocation,
        visualTags
    }: {
        scene: Phaser.Scene;
        container: Phaser.GameObjects.Container;
        cardBackground: Phaser.GameObjects.Image;
        cardImage: Phaser.GameObjects.Image;
        nameBackground: Phaser.GameObjects.Rectangle;
        nameText: Phaser.GameObjects.Text;
        descText: Phaser.GameObjects.Text;
        tooltipBackground: Phaser.GameObjects.Rectangle;
        tooltipText: Phaser.GameObjects.Text;
        descBackground: Phaser.GameObjects.Rectangle;
        data: AbstractCard;
        cardLocation: CardLocation;
        visualTags: PhysicalCardVisualTag[];
    }) {
        this.scene = scene;
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
        this.visualTags = [];

        this.updateVisuals();
        this.scene.events.on('update', this.updateVisuals, this);
    }

    updateVisuals(): void {
        this.nameText.setText(this.data.name);
        this.descText.setText(this.data.description);
        this.tooltipText.setText(this.data.tooltip);
        this.cardImage.setTexture(this.data.portraitName);
        this.updateVisualTags();
    }

    addVisualTag(tag: PhysicalCardVisualTag): void {
        this.visualTags.push(tag);
        this.container.add([tag.image, tag.text]);
        tag.tag.updateVisuals(tag.image, tag.text);
    }

    removeVisualTag(tag: PhysicalCardVisualTag): void {
        const index = this.visualTags.indexOf(tag);
        if (index > -1) {
            this.visualTags.splice(index, 1);
            this.container.remove(tag.image);
            this.container.remove(tag.text);
            tag.image.destroy();
            tag.text.destroy();
        }
    }

    updateVisualTags(): void {
        this.visualTags.forEach(tag => {
            tag.tag.updateVisuals(tag.image, tag.text);
        });
    }

    destroy(): void {
        this.scene.events.off('update', this.updateVisuals, this);
        this.container.destroy();
    }
}

export interface PhysicalCardVisualTag {
    image: Phaser.GameObjects.Image;
    text: Phaser.GameObjects.Text;
    tag: AbstractCardVisualTag;
}

export abstract class AbstractCardVisualTag {
    abstract getText(): string;
    abstract updateVisuals(image: Phaser.GameObjects.Image, text: Phaser.GameObjects.Text): void;
}