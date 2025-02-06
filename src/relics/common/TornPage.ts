import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { AbstractRelic } from "../AbstractRelic";

export class TornPage extends AbstractRelic {
    private readonly BASE_ASHES = 2;

    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
        this.stackable = true;
        this.stacks = 1;
    }

    getDisplayName(): string {
        return "Torn Page";
    }

    getDescription(): string {
        return `At the start of combat, increase your Ashes by ${this.BASE_ASHES * this.stacks}.`;
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyAshes(this.BASE_ASHES * this.stacks);
    }
}
