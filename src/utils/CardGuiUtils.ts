import { AbstractCard, CardScreenLocation, CardType, PhysicalCard } from "../gamecharacters/PhysicalCard";

export interface GameConfig {
    cardWidth: number;
    cardHeight: number;
    battlefieldY: number;
    handY: number;
    dividerY: number;
    gameWidth: number;
    gameHeight: number;
}

export class CardGuiUtils {
    config: GameConfig = {
        cardWidth: 120,
        cardHeight: 160,
        battlefieldY: 200,
        handY: 500,
        dividerY: 350,
        gameWidth: 800,
        gameHeight: 600
    };

    
    createCard(params: {
        scene: Phaser.Scene,
        x: number,
        y: number,
        data: AbstractCard,
        location: CardScreenLocation,
        eventCallback: (card: PhysicalCard) => void
    }): PhysicalCard {
        const { scene, x, y, data, location, eventCallback } = params;
        const cardContainer = scene.add.container(x, y);
        const { cardWidth, cardHeight } = this.config;
        const cardBackground = scene.add.image(0, 0, 'greyscale').setDisplaySize(cardWidth, cardHeight);
        let cardTexture = data.portraitName;

        const cardImage = scene.add.image(0, -cardHeight / 4, cardTexture)
            .setDisplaySize(cardWidth / 2, cardHeight / 2);

        const nameBackground = scene.add.rectangle(0, cardHeight / 4, cardWidth - 10, 60, 0xffffff).setStrokeStyle(2, 0x000000);
        const nameText = scene.add.text(0, cardHeight / 4, data.name, { fontSize: '16px', color: '#000', wordWrap: { width: cardWidth - 10 } });

        const descText = scene.add.text(0, cardHeight / 2, data.description, {
            fontSize: '12px',
            color: '#000',
            wordWrap: { width: cardWidth - 20 },
            align: 'center'
        }).setVisible(false);

        const tooltipText = scene.add.text(cardWidth + 5, 0, data.tooltip || '', {
            fontSize: '12px',
            color: '#000',
            wordWrap: { width: cardWidth - 20 },
            align: 'left'
        }).setVisible(false);

        // Create backgrounds that will resize with the text
        const infoBackground = scene.add.rectangle(0, cardHeight / 2, cardWidth - 10, 60, 0xffffff).setStrokeStyle(2, 0x000000);
        const tooltipBackground = scene.add.rectangle(cardWidth + cardWidth / 2, 0, cardWidth - 10, cardHeight, 0xffffff).setStrokeStyle(2, 0x000000);

        // Function to update background sizes
        const updateBackgrounds = () => {
            infoBackground.setSize(cardWidth - 10, descText.height + 20);
            infoBackground.setPosition(0, cardHeight / 2 + descText.height / 4);
            descText.setPosition(0, cardHeight / 2 + descText.height / 4);
            // Update name background and text
            nameBackground.setSize(cardWidth - 10, nameText.height + 10);
            nameBackground.setPosition(0, cardHeight / 4);
            nameText.setPosition(0, cardHeight / 4);

            tooltipBackground.setSize(cardWidth - 10, tooltipText.height + 20);
            tooltipBackground.setPosition(cardWidth + cardWidth / 2, tooltipText.height / 2);
        };

        // Call updateBackgrounds initially
        updateBackgrounds();
        descText.on('changedata', updateBackgrounds);
        tooltipText.on('changedata', updateBackgrounds);

        // Create hidden highlight border
        const highlightBorder = scene.add.rectangle(0, 0, cardWidth + 10, cardHeight + 10, 0xffff00)
            .setStrokeStyle(4, 0xffff00)
            .setFillStyle(0x000000, 0)
            .setVisible(false)
            .setName('highlightBorder');

        nameText.setOrigin(0.5);
        descText.setOrigin(0.5);
        tooltipText.setOrigin(0, 0);
        tooltipText.setPosition(cardWidth + 10, 10);
        descText.setVisible(false);
        tooltipText.setVisible(false);

        infoBackground.setVisible(false);
        tooltipBackground.setVisible(false);
        
        cardContainer.add([cardBackground, cardImage, nameBackground, nameText, tooltipBackground, tooltipText, infoBackground, descText, highlightBorder]);
        cardContainer.setSize(cardWidth, cardHeight);
        cardContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, cardWidth, cardHeight), Phaser.Geom.Rectangle.Contains);

        if (data.cardType == CardType.PLAYABLE) scene.input.setDraggable(cardContainer);

        const physicalCard = new PhysicalCard({
            container: cardContainer,
            cardBackground: cardBackground,
            cardImage: cardImage,
            nameBackground: nameBackground,
            nameText: nameText,
            descText: descText,
            tooltipText: tooltipText,
            descBackground: infoBackground,
            tooltipBackground: tooltipBackground,
            data: data,
            cardLocation: location,
            visualTags: [],
            scene: scene,
        });

        (cardContainer as any).physicalCard = physicalCard;

        eventCallback(physicalCard);
        return physicalCard;
    }

}