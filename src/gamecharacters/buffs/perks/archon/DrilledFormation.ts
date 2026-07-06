import { AbstractBuff } from "../../AbstractBuff";

/**
 * Archon perk. Combat-start self-Block grant, same proven shape as
 * standard/Armored.ts (onTurnStart there; here it fires once at combat
 * start, matching the other perk/persona combat-start hooks).
 */
export class DrilledFormation extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Drilled Formation";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Block. Close order and a steady pulse, per the training manual.`;
    }

    override onCombatStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBlock({ baseBlockValue: this.stacks, blockTargetCharacter: owner });
        }
    }
}
