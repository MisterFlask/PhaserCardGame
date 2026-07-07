import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../gamecharacters/PlayableCard";
import { BasicProcs } from "../../gamecharacters/procs/BasicProcs";
import { AbstractRelic } from "../AbstractRelic";

export class DevouringIcon extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.UNCOMMON;
        this.imageName = "devouring-icon";
        this.flavorText = "It has opinions about your spending habits, and the opinions are teeth.";
    }

    override getDisplayName(): string {
        return "Devouring Icon";
    }

    override getDescription(): string {
        return "Whenever you play a card with cost 2 or greater, Sacrifice.";
    }

    override onAnyCardPlayedByAnyone(card: PlayableCard): void {
        if (card && card.baseEnergyCost >= 2) {
            BasicProcs.getInstance().SacrificeACardOtherThan(card);
        }
    }
}
