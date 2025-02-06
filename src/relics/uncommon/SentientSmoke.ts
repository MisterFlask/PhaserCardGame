import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { EldritchSmoke } from "../../gamecharacters/playerclasses/cards/diabolist/tokens/EldritchSmoke";
import { BasicProcs } from "../../gamecharacters/procs/BasicProcs";
import { AbstractCombatEvent } from "../../rules/AbstractCombatEvent";
import { SpentCombatResourceEvent } from "../../utils/actions/CombatEvents";
import { AbstractRelic } from "../AbstractRelic";

export class SentientSmoke extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.UNCOMMON;
        this.stackable = false;
    }

    getDisplayName(): string {
        return "Sentient Smoke";
    }

    getDescription(): string {
        return "Whenever you spend Smog, manufacture an Eldritch Smoke to your hand.";
    }

    onEvent(event: AbstractCombatEvent): void {
        if (event instanceof SpentCombatResourceEvent && event.resourceAfterSpending.name === "Smog") {
            BasicProcs.getInstance().ManufactureCardToHand(new EldritchSmoke());
        }
    }
}