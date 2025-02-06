import { Hazardous } from "../../gamecharacters/buffs/playable_card/Hazardous";
import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class WhisperOfSorrow extends AbstractRelic {
    private readonly HAZARDOUS_CHANCE = 0.4;
    private readonly HAZARDOUS_STACKS = 2;

    constructor() {
        super();
        this.rarity = EntityRarity.UNCOMMON;
    }

    override getDisplayName(): string {
        return "Whisper of Sorrow";
    }

    override getDescription(): string {
        return `All card rewards have a ${this.HAZARDOUS_CHANCE * 100}% chance of being Hazardous ${this.HAZARDOUS_STACKS}.`;
    }

    override onCardUpgraded(card: PlayableCard): void {
        if (Math.random() < this.HAZARDOUS_CHANCE) {
            this.actionManager.applyBuffToCard(card, new Hazardous(this.HAZARDOUS_STACKS));
        }
    }
}
