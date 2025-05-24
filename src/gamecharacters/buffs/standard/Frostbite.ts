import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class Frostbite extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
        this.stackable = true;
        this.imageName = "snowflake";
        this.secondaryStacks = 0;
    }

    override getDisplayName(): string { return "Frostbite"; }
    override getDescription(): string {
        return `Lose 1 Dexterity and 1 Lethality. Playing two cards removes Frostbite.`;
    }

    override getBlockSentModifier(_target?: BaseCharacter): number {
        return -1 * this.stacks;
    }

    override getCombatDamageDealtModifier(_target?: BaseCharacter, _sourceCard?: PlayableCard): number {
        return -1 * this.stacks;
    }

    override onTurnStart(): void {
        this.secondaryStacks = 0;
    }

    override onAnyCardPlayedByAnyone(card: PlayableCard): void {
        const owner = this.getOwnerAsCharacter();
        if (owner && card.owningCharacter === owner) {
            this.secondaryStacks++;
            if (this.secondaryStacks >= 2) {
                this.actionManager.removeBuffFromCharacter(owner, this.getDisplayName());
            }
        }
    }
}
