/// no-op; tallied up at end of game

import { AbstractBuff } from "../../gamecharacters/buffs/AbstractBuff";

export class VictoryPointValue extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.isDebuff = false;
        this.stackable = true;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    getDisplayName(): string {
        return "Victory Points";
    }

    getDescription(): string {
        return `Provides ${this.getStacksDisplayText()} victory points at the end of the game.`;
    }
}


