import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { EldritchSmoke } from "../../gamecharacters/playerclasses/cards/diabolist/tokens/EldritchSmoke";
import { BasicProcs } from "../../gamecharacters/procs/BasicProcs";
import { CombatResourceUsedEvent } from "../../rules/combatresources/AbstractCombatResource";
import { AbstractRelic } from "../AbstractRelic";

export class SentientSmoke extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.UNCOMMON;
        this.stackable = false;
        this.imageName = "sentient-smoke";
    }

    getDisplayName(): string {
        return "Sentient Smoke";
    }

    getDescription(): string {
        return "Whenever you spend Smog, manufacture an Eldritch Smoke to your hand.";
    }

    override onEvent(event: CombatResourceUsedEvent): void {
        if (event instanceof CombatResourceUsedEvent && event.isSmog()) {
            BasicProcs.getInstance().ManufactureCardToHand(new EldritchSmoke());
        }
    }
}