import type { AbstractCard } from "../gamecharacters/AbstractCard";
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

        const physicalCard = new PhysicalCard({
            scene: scene,
            x: x,
            y: y,
            data: data,
            cardConfig: this.cardConfig
        });

        eventCallback(physicalCard);
        physicalCard.contextRelevant = contextRelevant;
        return physicalCard;
    }
}
