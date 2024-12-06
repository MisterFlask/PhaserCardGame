import { AbstractBuff } from "../AbstractBuff";

export class TemporaryLethality extends AbstractBuff {
    

    override getDisplayName(): string {
        return "Temporary Lethality";
    }

    override getDescription(): string {
        return `Increases damage by ${this.getStacksDisplayText()} until end of turn.`;
    }

    constructor(stacks: number = 1) {
        super();
        this.imageName = "temporary-strength";
        this.stacks = stacks;
    }

    override getCombatDamageDealtModifier(): number {
        return this.stacks;
    }

    override onTurnEnd_CharacterBuff(): void {
        this.stacks = 0;
    }
}
