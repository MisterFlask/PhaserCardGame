import { AbstractCard, PhysicalCard } from "../gamecharacters/PhysicalCard";
import { CardType } from "../gamecharacters/Primitives";
import { Label } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
declare module 'phaser' {
  interface Scene {
    rexUI: RexUIPlugin;
  }
}
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
        eventCallback: (card: PhysicalCard) => void
    }): PhysicalCard {
        const { scene, x, y, data, eventCallback } = params;
        const cardContainer = scene.add.container(x, y);
        const { cardWidth, cardHeight } = this.cardConfig;
        const cardBackground = scene.add.image(0, 0, 'greyscale').setDisplaySize(cardWidth, cardHeight);
        let cardTexture = data.portraitName;
        
        const cardImage = scene.add.image(0, -cardHeight / 4, cardTexture)
            .setDisplaySize(cardWidth / 2, cardHeight / 2);

        const nameLabel = scene.rexUI.add.label({
            x: 0,
            y: cardHeight / 4,
            width: cardWidth,
            height: 30,
            background: scene.rexUI.add.roundRectangle(0, 0, cardWidth, 30, 5, 0xffffff),
            text: scene.add.text(0, 0, data.name, { fontSize: '16px', color: '#000', wordWrap: { width: cardWidth - 20 } }),
            space: { left: 10, right: 10, top: 5, bottom: 5 },
            align: 'center'
        }).setOrigin(0.5);

        const descLabel = scene.rexUI.add.label({
            x: 0,
            y: cardHeight / 2,
            width: cardWidth,
            height: 60,
            background: scene.rexUI.add.roundRectangle(0, 0, cardWidth, 60, 5, 0xffffff),
            text: scene.add.text(0, 0, data.description, { fontSize: '12px', color: '#000', wordWrap: { width: cardWidth - 20 }, align: 'center' }),
            space: { left: 10, right: 10, top: 5, bottom: 5 },
            align: 'center'
        }).setOrigin(0.5);

        const tooltipLabel = scene.rexUI.add.label({
            x: cardWidth + cardWidth / 2,
            y: 0,
            width: cardWidth,
            height: cardHeight,
            background: scene.rexUI.add.roundRectangle(0, 0, cardWidth, cardHeight, 5, 0xffffff),
            text: scene.add.text(0, 0, data.tooltip || '', { fontSize: '12px', color: '#000', wordWrap: { width: cardWidth - 20 }, align: 'left' }),
            space: { left: 10, right: 10, top: 10, bottom: 10 },
            align: 'left'
        }).setOrigin(0.5);

        // Function to update label sizes
        const updateLabelSizes = () => {
            nameLabel.layout();
            descLabel.layout();
            tooltipLabel.layout();
        };

        // Call updateLabelSizes initially
        updateLabelSizes();

        // Create hidden highlight border
        const highlightBorder = scene.add.rectangle(0, 0, cardWidth + 10, cardHeight + 10, 0xffff00)
            .setStrokeStyle(4, 0xffff00)
            .setFillStyle(0x000000, 0)
            .setVisible(false)
            .setName('highlightBorder');

        descLabel.setVisible(false);
        tooltipLabel.setVisible(false);
        
        cardContainer.add([cardBackground, cardImage, nameLabel, tooltipLabel, descLabel, highlightBorder]);
        cardContainer.setSize(cardWidth, cardHeight);
        cardContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, cardWidth, cardHeight), Phaser.Geom.Rectangle.Contains);

        if (data.cardType == CardType.PLAYABLE) scene.input.setDraggable(cardContainer);

        const physicalCard = new PhysicalCard({
            scene: scene,
            container: cardContainer,
            cardBackground: cardBackground,
            cardImage: cardImage,
            nameLabel: nameLabel,
            descLabel: descLabel,
            tooltipLabel: tooltipLabel,
            data: data,
            visualTags: []
        });

        (cardContainer as any).physicalCard = physicalCard;

        eventCallback(physicalCard);
        return physicalCard;
    }
}