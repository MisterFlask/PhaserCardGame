import { AbstractBuff } from "../../AbstractBuff";

/**
 * Cog perk. Combat-start self-Block grant, same proven shape as
 * perks/archon/DrilledFormation.ts.
 */
export class ReinforcedChassis extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Reinforced Chassis";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Block. Riveted plate over the load-bearing organs, per the Whitworth spec sheet.`;
    }

    override onCombatStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBlock({ baseBlockValue: this.stacks, blockTargetCharacter: owner });
        }
    }
}
