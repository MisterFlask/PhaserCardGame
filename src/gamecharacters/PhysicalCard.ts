import { GameAction } from "../utils/ActionQueue";
import { AbstractCard } from "./AbstractCard";
import { BaseCharacter } from "./AbstractCard";

export enum CardScreenLocation {
    BATTLEFIELD,
    HAND,
    CHARACTER_ROSTER,
    SHOP,
    DRAW_PILE,
    DISCARD_PILE
}

export enum CardType {
    CHARACTER = "CHARACTER",
    PLAYABLE = "PLAYABLE",
    STORE = "STORE",
    LOCATION = "LOCATION"
}

export enum CardSize {
    SMALL = 1,
    MEDIUM = 1.5,
    LARGE = 2
}
export class TextBox {


    background: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image | null;
    text: Phaser.GameObjects.Text;
    outline: Phaser.GameObjects.Rectangle;
    textBoxName?: string
    constructor(params: {
        scene: Phaser.Scene,
        x?: number,
        y?: number,
        width?: number,
        height?: number,
        text?: string,
        style?: Phaser.Types.GameObjects.Text.TextStyle,
        backgroundImage?: string,
        textBoxName?: string
    }) {
        const {
            scene,
            x = 0,
            y = 0,
            width = 100,
            height = 50,
            text = '',
            style = { fontSize: '16px', color: '#000' },
            backgroundImage,
            textBoxName
        } = params;
        this.textBoxName = textBoxName ?? "anonymousTextBox";

        if (backgroundImage) {
            this.background = scene.add.image(x, y, backgroundImage).setDisplaySize(width, height);
        } else {
            this.background = scene.add.rectangle(x, y, width, height, 0xffffff);
        }
        this.outline = scene.add.rectangle(x, y, width, height).setStrokeStyle(2, 0x000000);
        this.text = scene.add.text(x, y, text, style);
        this.text.setOrigin(0.5);
        // Enforce text wrapping within bounds
        this.text.setWordWrapWidth(width - 10); // Subtract padding
        this.text.setAlign('center');

        // Adjust text size if it overflows
        const originalFontSize = parseInt(style.fontSize as string);
        let currentFontSize = originalFontSize;
        while ((this.text.height > height - 10 || this.text.width > width - 10) && currentFontSize > 8) { // Minimum font size of 8
            currentFontSize--;
            this.text.setFontSize(currentFontSize);
            this.text.setWordWrapWidth(width - 10);
        }

    }

    setPosition(x: number, y: number): void {
        if (this.background === null) {
            return;
        }
        this.background.setPosition(x, y);
        this.outline.setPosition(x, y);
        this.text.setPosition(x, y);
    }

    setSize(width: number, height: number): void {
        if (this.background === null) {
            return;
        }
        if (this.background instanceof Phaser.GameObjects.Rectangle) {
            this.background.setSize(width, height);
        } else {
            this.background.setDisplaySize(width, height);
        }
        this.outline.setSize(width, height);
    }

    setText(text: string): void {
        if (this.text.scene === null) {
            return;
        }
        if (this.background == null){
            return;
        }
        if ((this.text.frame as any)?.data) {
            // we do this because there are circumstances where data is not available
            // and it crashes the whole game
            this.text.setText(text);
        }else{
            console.log("text frame data is null for " + this.textBoxName);
        }
    }

    setVisible(visible: boolean): void {
        if (this.background === null) {
            return;
        }
        this.background.setVisible(visible);
        this.outline.setVisible(visible);
        this.text.setVisible(visible);
    }
    destroy(): void {
        if (this.background) {
            this.background.destroy();
        }
        this.background = null;
    }
}
import Phaser from 'phaser';

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


export class PhysicalCard {
    container: Phaser.GameObjects.Container;
    cardBackground: Phaser.GameObjects.Image;
    cardImage: Phaser.GameObjects.Image;
    nameBox: TextBox;
    descBox: TextBox;
    tooltipBox: TextBox;
    hpBox: TextBox | null;
    data: AbstractCard;
    cardLocation: CardScreenLocation;
    visualTags: PhysicalCardVisualTag[];
    scene: Phaser.Scene;
    isSelected: boolean = false;
    private wiggleTween: Phaser.Tweens.Tween | null = null;
    private hoverSound: Phaser.Sound.BaseSound | null = null;
    private cardContent: Phaser.GameObjects.Container;
    private obliterated: boolean = false;
    constructor({
        scene,
        container,
        cardBackground,
        cardImage,
        nameBox,
        descBox,
        tooltipBox,
        data,
        cardLocation,
        visualTags
    }: {
        scene: Phaser.Scene;
        container: Phaser.GameObjects.Container;
        cardBackground: Phaser.GameObjects.Image;
        cardImage: Phaser.GameObjects.Image;
        nameBox: TextBox;
        descBox: TextBox;
        tooltipBox: TextBox;
        data: AbstractCard;
        cardLocation: CardScreenLocation;
        visualTags: PhysicalCardVisualTag[];
    }) {
        this.scene = scene;
        this.container = container;
        this.cardBackground = cardBackground;
        this.cardImage = cardImage;
        this.nameBox = nameBox;
        this.descBox = descBox;
        this.tooltipBox = tooltipBox;
        this.data = data;
        this.cardLocation = cardLocation;
        this.visualTags = [];

        // Create a new container for card content (excluding tooltip)
        this.cardContent = this.scene.add.container();
        this.cardContent.add([this.cardBackground, this.cardImage, this.nameBox.background!!, this.nameBox.outline, this.nameBox.text, this.descBox.background!!, this.descBox.outline, this.descBox.text]);
        this.container.add(this.cardContent);

        // Add tooltip elements directly to the main container
        this.container.add([this.tooltipBox.background!!, this.tooltipBox.outline, this.tooltipBox.text]);

        // Add HP box if the card is a BaseCharacter
        if (this.data instanceof BaseCharacter) {
            const baseCharacter = this.data as BaseCharacter;
            const cardWidth = this.cardBackground.displayWidth;
            const cardHeight = this.cardBackground.displayHeight;
            this.hpBox = new TextBox({
                scene: this.scene,
                x: cardWidth / 2 - 20,
                y: -cardHeight / 2 + 20,
                width: 40,
                height: 20,
                text: `${baseCharacter.hitpoints}/${baseCharacter.maxHitpoints}`,
                style: { fontSize: '12px', color: '#000' }
            });
            this.cardContent.add([this.hpBox.background!!, this.hpBox.outline, this.hpBox.text]);
        } else {
            this.hpBox = null;
        }

        // Load the rollover sound if it's not already loaded
        if (!this.scene.cache.audio.exists('rollover6')) {
            const baseUrl = 'https://raw.githubusercontent.com/MisterFlask/PhaserCardGame/master/resources/';
            this.scene.load.audio('rollover6', baseUrl + 'Sounds/Effects/rollover6.ogg');
            this.scene.load.once('complete', () => {
                if (this.scene.cache.audio.exists('rollover6')) {
                    this.hoverSound = this.scene.sound.add('rollover6');
                } else {
                    console.error('Failed to load rollover6 sound from the server');
                }
            });
            this.scene.load.start();
        } else {
            this.hoverSound = this.scene.sound.add('rollover6');
        }

        this.updateVisuals();
        this.scene.events.on('update', this.updateVisuals, this);
        this.setupInteractivity();
        this.applyCardSize();
    }

    obliterate(): void {
        // Remove event listener
        this.scene.events.off('update', this.updateVisuals, this);

        // Stop and remove the wiggle tween if it exists
        if (this.wiggleTween) {
            this.wiggleTween.stop();
            this.wiggleTween.remove();
            this.wiggleTween = null;
        }

        // Destroy the hover sound if it exists
        if (this.hoverSound) {
            this.hoverSound.destroy();
        }

        // Destroy all TextBox components
        this.nameBox.destroy();
        this.descBox.destroy();
        this.tooltipBox.destroy();
        if (this.hpBox) {
            this.hpBox.destroy();
        }

        // Destroy the card image
        if (this.cardImage) {
            this.cardImage.destroy();
        }

        // Destroy the card background
        if (this.cardBackground) {
            this.cardBackground.destroy();
        }

        // Destroy containers
        if (this.cardContent) {
            this.cardContent.destroy();
        }
        if (this.container) {
            this.container.destroy();
        }
        this.obliterated = true;
    }

    applyCardSize(): void {
        const scale = this.data.size;
        this.cardContent.setScale(scale);
    }

    setupInteractivity(): void {
        this.container.setInteractive()
            .on('pointerover', this.onPointerOver_PhysicalCard, this)
            .on('pointerout', this.onPointerOut_PhysicalCard, this);
    }

    onPointerOver_PhysicalCard = (): void => {
        if (this.obliterated) {
            return;
        }
        console.log(`Pointer over card: ${this.data.name}`);
        this.cardContent.setScale(this.data.size * 1.1);
        this.descBox.setVisible(true);
        this.tooltipBox.setVisible(true);
        this.container.setDepth(1000);

        // Determine tooltip position based on card's position
        const cardWidth = this.cardBackground.displayWidth * this.data.size;
        const gameWidth = this.scene.scale.width;
        const cardCenterX = this.container.x;

        // Set tooltip text
        this.tooltipBox.setText(this.data.tooltip);

        // Calculate tooltip dimensions
        const padding = 10;
        const tooltipWidth = this.tooltipBox.text.width + padding * 2;
        const tooltipHeight = this.tooltipBox.text.height + padding * 2;

        // Update tooltip background
        this.tooltipBox.setSize(tooltipWidth, tooltipHeight);

        if (cardCenterX > gameWidth / 2) {
            // Card is on the right side, show tooltip on the left
            this.tooltipBox.setPosition(-cardWidth - tooltipWidth / 2, 0);
        } else {
            // Card is on the left side, show tooltip on the right
            this.tooltipBox.setPosition(cardWidth + tooltipWidth / 2, 0);
        }

        // Play hover sound
        if (this.hoverSound) {
            // this.hoverSound.play(); //tbd i now find this annoying
        }
        // Add wiggle animation
        if (!this.wiggleTween) {
            this.wiggleTween = this.scene.tweens.add({
                targets: this.cardContent,
                angle: { from: -1, to: 1 },
                duration: 80,
                repeat: 1,
                yoyo: true,
                onComplete: () => {
                    this.cardContent.setAngle(0);
                    this.wiggleTween = null;
                }
            });
        }
    }

    onPointerOut_PhysicalCard = (): void => {
        if (this.obliterated) {
            return;
        }
        console.log(`Pointer out card: ${this.data.name}`);
        this.cardContent.setScale(this.data.size);
        this.descBox.setVisible(false);
        this.tooltipBox.setVisible(false);
        this.container.setDepth(0);

        // Stop wiggle animation if it's still running
        if (this.wiggleTween) {
            this.wiggleTween.stop();
            this.wiggleTween = null;
            this.cardContent.setAngle(0);
        }
    }

    updateVisuals(): void {
        if (this.obliterated) {
            return;
        }
        if (!this.scene || !this.scene.sys) {
            console.warn('Scene is undefined in updateVisuals');
            return;
        }
        if (!this.cardImage.scene || !this.cardImage.scene.sys) {
            console.warn('Scene is undefined in updateVisuals (BUT FOR THE CARDIMAGE SPECIFICALLY): ' + this.data.name);
            this.cardImage.scene = this.scene;
            return;
        }

        this.nameBox.setText(this.data.name);
        this.descBox.setText(this.data.description);
        this.tooltipBox.setText(this.data.tooltip);

        // Check if the texture exists before setting it
        if (this.scene.textures.exists(this.data.portraitName)) {
            
            // Maintain aspect ratio
            const texture = this.scene.textures.get(this.data.portraitName);
            texture.setFilter(Phaser.Textures.LINEAR);
            this.cardImage.setTexture(this.data.portraitName);
            this.cardImage.texture.setFilter(Phaser.Textures.LINEAR);
            const frame = texture.get();
            const aspectRatio = frame.width / frame.height;
            
            // Assuming the card background defines the available space
            const availableWidth = this.cardBackground.displayWidth * 0.9; // 90% of card width
            const availableHeight = this.cardBackground.displayHeight * 0.6; // 60% of card height
            
            let newWidth = availableWidth;
            let newHeight = availableWidth / aspectRatio;
            
            if (newHeight > availableHeight) {
                newHeight = availableHeight;
                newWidth = availableHeight * aspectRatio;
            }
            
            this.cardImage.setDisplaySize(newWidth, newHeight);
            
            // Center the image on the card
            this.cardImage.setPosition(0, -this.cardBackground.displayHeight * 0.25); // Move image to top quarter of card
        } else {
            console.warn(`Texture '${this.data.portraitName}' not found. Using fallback texture.`);
            // this.cardImage.setTexture('fallback_texture'); // Ensure you have a fallback texture
        }

        // Position nameBox just below the portraitBox
        const nameBoxY = this.cardImage.y + this.cardImage.displayHeight / 2 + this.nameBox.background!!.displayHeight / 2;
        this.nameBox.setPosition(0, nameBoxY);

        // Position descBox just below the nameBox
        const descBoxY = nameBoxY + this.nameBox.background!!.displayHeight / 2 + this.descBox.background!!.displayHeight / 2;
        this.descBox.setPosition(0, descBoxY);

        // Update HP box if it exists
        if (this.hpBox && this.data instanceof BaseCharacter) {
            const baseCharacter = this.data as BaseCharacter;
            this.hpBox.setText(`${baseCharacter.hitpoints}/${baseCharacter.maxHitpoints}`);
        }

        this.tooltipBox.setText(this.data.id);

        this.updateVisualTags();
    }

    addVisualTag(tag: PhysicalCardVisualTag): void {
        this.visualTags.push(tag);
        this.cardContent.add([tag.image, tag.text]);
        tag.tag.updateVisuals(tag.image, tag.text);
    }

    removeVisualTag(tag: PhysicalCardVisualTag): void {
        const index = this.visualTags.indexOf(tag);
        if (index > -1) {
            this.visualTags.splice(index, 1);
            this.cardContent.remove(tag.image);
            this.cardContent.remove(tag.text);
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
        if (this.wiggleTween) {
            this.wiggleTween.stop();
            this.wiggleTween = null;
        }
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

export { AbstractCard };
