// deals a flat 5 damage per turn.  Lasts [stacks] turns.

import { GameState } from "../../../rules/GameState";
import { ActionManager } from "../../../utils/ActionManager";
import { AbstractBuff } from "../AbstractBuff";

export class Smoldering extends AbstractBuff {
    constructor(stacks: number) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
    }
    getName(): string {
        return "Smoldering";
    }

    getDescription(): string {
        return `Deals 5 damage at end of each turn, plus 1 per 2 [F]. Lasts for ${this.stacks} more turn${this.stacks !== 1 ? 's' : ''}.`;
    }

    override onTurnEnd(): void {
        ActionManager.getInstance().dealDamage({ target: this.getOwner()!, baseDamageAmount: 5 + Math.floor(GameState.getInstance().combatState.combatResources.fire.value / 2)});
        this.stacks--;
    }
}