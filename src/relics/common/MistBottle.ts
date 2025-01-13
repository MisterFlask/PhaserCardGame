import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class MistBottle extends AbstractRelic {
    private readonly BASE_SMOG = 2;

    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
        this.stackable = true;
        this.stacks = 1;
    }

    getDisplayName(): string {
        return "Bottle of Fine London Mist";
    }

    getDescription(): string {
        return `At the start of combat, increase your Smog by ${this.BASE_SMOG * this.stacks}.`;
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifySmog(this.BASE_SMOG * this.stacks);
    }
}
