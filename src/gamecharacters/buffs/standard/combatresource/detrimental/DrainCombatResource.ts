
// Start Generation Here
import { AbstractCombatResource } from "../../../../../rules/combatresources/AbstractCombatResource";
import { AbstractBuff } from "../../../AbstractBuff";

export class DrainCombatResource extends AbstractBuff {
    resource:  AbstractCombatResource;

    constructor(resource:  AbstractCombatResource, stacks: number = 1) {
        super();
        this.resource = resource;
        this.stacks = stacks;
    }

    getDisplayName(): string {
        return `Drain ${this.resource.name}`;
    }

    getDescription(): string {
        return `At the end of the turn, lose ${this.getStacksDisplayText()} ${this.resource.glyph}.`;
    }

    override onTurnEnd(): void {
        this.actionManager.modifyCombatResource(this.resource, -this.stacks);
    }
}
