import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { AbstractRelic } from "../AbstractRelic";

export class VialOfBlood extends AbstractRelic {
    private readonly BASE_BLOOD = 2;

    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
        this.stackable = true;
        this.stacks = 1;
    }

    getDisplayName(): string {
        return "Vial of Blood";
    }

    getDescription(): string {
        return `At the start of combat, increase your Blood by ${this.BASE_BLOOD * this.stacks}.`;
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyBlood(this.BASE_BLOOD * this.stacks);
    }
}
