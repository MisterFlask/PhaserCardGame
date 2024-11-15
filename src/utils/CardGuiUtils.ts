import type { AbstractCard } from "../gamecharacters/AbstractCard";
import { CardType } from "../gamecharacters/Primitives";
import { PhysicalCard } from "../ui/PhysicalCard";
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
        
        cardContainer.setSize(cardWidth, cardHeight);
        cardContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, cardWidth, cardHeight), Phaser.Geom.Rectangle.Contains);

        if (data.cardType == CardType.SKILL) scene.input.setDraggable(cardContainer);

        const physicalCard = new PhysicalCard({
            scene: scene,
            container: cardContainer,
            data: data,
            cardConfig: this.cardConfig
        });

        (cardContainer as any).physicalCard = physicalCard;

        eventCallback(physicalCard);
        physicalCard.contextRelevant = contextRelevant;
        return physicalCard;
    }
}
