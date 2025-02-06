import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { AbstractRelic } from "../AbstractRelic";

export class IronFilings extends AbstractRelic {
    private readonly BASE_METTLE = 2;

    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
        this.stackable = true;
        this.stacks = 1;
    }

    getDisplayName(): string {
        return "Iron Filings";
    }

    getDescription(): string {
        return `At the start of combat, increase your Mettle by ${this.BASE_METTLE * this.stacks}.`;
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyMettle(this.BASE_METTLE * this.stacks);
    }
}
