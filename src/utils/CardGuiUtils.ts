import type { AbstractCard } from "../gamecharacters/AbstractCard";
import { CardType } from "../gamecharacters/Primitives";
import { PhysicalCard } from "../ui/PhysicalCard";
import { TextBox } from "../ui/TextBox";
import { UIContext } from "../ui/UIContextManager";

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
        contextRelevant?: UIContext,
        onCardCreatedEventCallback?: (card: PhysicalCard) => void
    }): PhysicalCard {
        var { scene, x, y, data, contextRelevant, onCardCreatedEventCallback: eventCallback } = params;
        if (!eventCallback) {
            eventCallback = (card: PhysicalCard) => {};
        }

        const cardContainer = scene.add.container(x, y);
        const { cardWidth, cardHeight } = this.cardConfig;
        const cardBackground = scene.add.image(0, 0, data.getCardBackgroundImageName())
            .setDisplaySize(cardWidth, cardHeight);
        
        const cardImage = scene.add.image(0, -cardHeight / 4, data.getEffectivePortraitName(scene))
            .setDisplaySize(cardWidth / 2, cardHeight / 2);
        const nameBox = new TextBox({
            scene: scene,
            x: 0,
            y: cardHeight / 4,
            width: cardWidth - 10,
            height: 60,
            text: data.name,
            textBoxName: "nameBox:" + data.id,
            style: { fontSize: '16px', color: '#000', wordWrap: { width: cardWidth - 10 } }
        });
        
        cardContainer.add([cardBackground, cardImage, nameBox]);
        cardContainer.setSize(cardWidth, cardHeight);
        cardContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, cardWidth, cardHeight), Phaser.Geom.Rectangle.Contains);

        if (data.cardType == CardType.SKILL) scene.input.setDraggable(cardContainer);

        const physicalCard = new PhysicalCard({
            scene: scene,
            container: cardContainer,
            cardBackground: cardBackground,
            cardImage: cardImage,
            nameBox: nameBox,
            data: data,
            cardConfig: this.cardConfig
        });

        (cardContainer as any).physicalCard = physicalCard;

        eventCallback(physicalCard);
        physicalCard.contextRelevant = contextRelevant;
        return physicalCard;
    }
}
