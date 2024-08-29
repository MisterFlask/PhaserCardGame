import { AbstractCard, CardScreenLocation, CardType, PhysicalCard, TextBox } from "../gamecharacters/PhysicalCard";

export interface CardConfig {
    cardWidth: number;
    cardHeight: number;
}

export class CardGuiUtils {
    private static instance: CardGuiUtils;
    public cardConfig: CardConfig = {
        cardWidth: 120,
        cardHeight: 160,
    };

    private constructor() {}

    public static getInstance(): CardGuiUtils {
        if (!CardGuiUtils.instance) {
            CardGuiUtils.instance = new CardGuiUtils();
        }
        return CardGuiUtils.instance;
    }

    public createCard(params: {
        scene: Phaser.Scene,
        x: number,
        y: number,
        data: AbstractCard,
        location: CardScreenLocation,
        eventCallback: (card: PhysicalCard) => void
    }): PhysicalCard {
        const { scene, x, y, data, location, eventCallback } = params;
        const cardContainer = scene.add.container(x, y);
        const { cardWidth, cardHeight } = this.cardConfig;
        const cardBackground = scene.add.image(0, 0, 'greyscale').setDisplaySize(cardWidth, cardHeight);
        let cardTexture = data.portraitName;
        
        const cardImage = scene.add.image(0, -cardHeight / 4, cardTexture)
            .setDisplaySize(cardWidth / 2, cardHeight / 2);
        const nameBox = new TextBox({
            scene: scene,
            x: 0,
            y: cardHeight / 4,
            width: cardWidth - 10,
            height: 60,
            text: data.name,
            style: { fontSize: '16px', color: '#000', wordWrap: { width: cardWidth - 10 } }
        });
        const descBox = new TextBox({
            scene: scene,
            x: 0,
            y: cardHeight / 2,
            width: cardWidth - 10,
            height: 60,
            text: data.description,
            style: {
                fontSize: '12px',
                color: '#000',
                wordWrap: { width: cardWidth - 20 },
                align: 'center'
            }
        });
        const tooltipBox = new TextBox({
            scene: scene,
            x: cardWidth + cardWidth / 2,
            y: 0,
            width: cardWidth - 10,
            height: cardHeight,
            text: data.tooltip || '',
            style: {
                fontSize: '12px',
                color: '#000',
                wordWrap: { width: cardWidth - 20 },
                align: 'left'
            }
        });

        // Function to update background sizes
        const updateBackgrounds = () => {
            descBox.setSize(cardWidth - 10, descBox.text.height + 20);
            descBox.setPosition(0, cardHeight / 2 + descBox.text.height / 4);
            nameBox.setSize(cardWidth - 10, nameBox.text.height + 10);
            nameBox.setPosition(0, cardHeight / 4);
            tooltipBox.setSize(cardWidth - 10, tooltipBox.text.height + 20);
            tooltipBox.setPosition(cardWidth + cardWidth / 2, tooltipBox.text.height / 2);
        };

        // Call updateBackgrounds initially
        updateBackgrounds();
        descBox.text.on('changedata', updateBackgrounds);
        tooltipBox.text.on('changedata', updateBackgrounds);

        // Create hidden highlight border
        const highlightBorder = scene.add.rectangle(0, 0, cardWidth + 10, cardHeight + 10, 0xffff00)
            .setStrokeStyle(4, 0xffff00)
            .setFillStyle(0x000000, 0)
            .setVisible(false)
            .setName('highlightBorder');

        descBox.setVisible(false);
        tooltipBox.setVisible(false);
        
        cardContainer.add([cardBackground, cardImage, nameBox.background, nameBox.text, tooltipBox.background, tooltipBox.text, descBox.background, descBox.text, highlightBorder]);
        cardContainer.setSize(cardWidth, cardHeight);
        cardContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, cardWidth, cardHeight), Phaser.Geom.Rectangle.Contains);

        if (data.cardType == CardType.PLAYABLE) scene.input.setDraggable(cardContainer);

        const physicalCard = new PhysicalCard({
            scene: scene,
            container: cardContainer,
            cardBackground: cardBackground,
            cardImage: cardImage,
            nameBox: nameBox,
            descBox: descBox,
            tooltipBox: tooltipBox,
            data: data,
            cardLocation: location,
            visualTags: []
        });

        (cardContainer as any).physicalCard = physicalCard;

        eventCallback(physicalCard);
        return physicalCard;
    }
}