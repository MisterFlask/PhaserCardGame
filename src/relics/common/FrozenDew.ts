import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class FrozenDew extends AbstractRelic {
    private readonly BASE_PLUCK = 2;

    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
        this.stackable = true;
        this.stacks = 1;
    }

    getDisplayName(): string {
        return "Frozen Dew";
    }

    getDescription(): string {
        return `At the start of combat, increase your Pluck by ${this.BASE_PLUCK * this.stacks}.`;
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyPluck(this.BASE_PLUCK * this.stacks);
    }
}
