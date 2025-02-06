import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../gamecharacters/PlayableCard";
import { Hazardous } from "../../gamecharacters/buffs/playable_card/Hazardous";
import { AbstractRelic } from "../AbstractRelic";

export class WraithInABottle extends AbstractRelic {
    private hasPlayedCardThisTurn: boolean = false;

    constructor() {
        super();
        this.rarity = EntityRarity.UNCOMMON;
    }

    override getDisplayName(): string {
        return "Wraith in a Bottle";
    }

    override getDescription(): string {
        return "The first card you play each turn gains Hazardous (2).";
    }

    override onTurnStart(): void {
        this.hasPlayedCardThisTurn = false;
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard): void {
        if (!this.hasPlayedCardThisTurn && playedCard.owningCharacter) {
            this.actionManager.applyBuffToCharacterOrCard(playedCard, new Hazardous(2));
            this.hasPlayedCardThisTurn = true;
        }
    }
}
