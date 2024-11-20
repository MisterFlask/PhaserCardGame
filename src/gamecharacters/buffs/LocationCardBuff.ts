import { BaseCharacter } from "../BaseCharacter";
import { AbstractBuff } from "./AbstractBuff";

export abstract class LocationCardBuff extends AbstractBuff {
    constructor() {
        super();
        this.stackable = false;
        this.isDebuff = false;
    }

    /**
     * Called when entering a new location with this buff
     */
    onLocationEntered(): void {
        // Override in subclasses
    }

    /**
     * Called at the start of combat with this buff
     */
    override onCombatStart(): void {
        // Override in subclasses
    }

    /**
     * Allows modifying card rewards when this buff is present
     * @param currentRewards The current card rewards
     * @returns The modified card rewards
     */
    alterCardRewards(currentRewards: BaseCharacter[]): BaseCharacter[] {
        // Override in subclasses to modify rewards
        return currentRewards;
    }
}
