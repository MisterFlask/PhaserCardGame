import { CombatResourceUsedEvent } from "../../../rules/combatresources/AbstractCombatResource";
import { AbstractBuff } from "../AbstractBuff";
import { Regeneration } from "../enemy_buffs/Regeneration";

export class Bloodsucker extends AbstractBuff {
    constructor(stacks: number = 1){
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.imageName = "blood";
    }

    override getDisplayName(): string {
        return "Bloodsucker";
    }

    override getDescription(): string {
        return `Whenever you gain Blood, this character receives +${this.getStacksDisplayText()} Regeneration.`;
    }

    override onEvent(event: CombatResourceUsedEvent): void {
        if (event instanceof CombatResourceUsedEvent && event.isBlood()) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                this.actionManager.applyBuffToCharacter(owner, new Regeneration(this.stacks));
            }
        }
    }
}
