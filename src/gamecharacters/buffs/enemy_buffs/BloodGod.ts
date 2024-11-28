import { AbstractCombatEvent } from "../../../rules/AbstractCombatEvent";
import { SacrificeEvent } from "../../procs/BasicProcs";
import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "../standard/Strong";

export class BloodGod extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Blood God";
    }

    override getDescription(): string {
        return `Whenever a sacrifice happens, gain ${this.getStacksDisplayText()} Strength.`;
    }

    override onEvent(event: AbstractCombatEvent): void {
        if (event instanceof SacrificeEvent) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                this.actionManager.applyBuffToCharacterOrCard(owner, new Lethality(this.stacks));
            }
        }
    }
}
