import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class RockSlides extends AbstractBuff {
    constructor(stacks: number) {
        super();
        this.stackable = true;
        this.isDebuff = true;
        this.stacks = stacks;
        }

    override getDisplayName(): string {
        return "Rock Slides";
    }

    override getDescription(): string {
        return `On entry, all allies take ${this.getStacksDisplayText()} damage.`;
    }

    override onLocationEntered(): void {
        this.forEachAlly((ally: BaseCharacter) => {
            this.actionManager.dealDamage({
                baseDamageAmount: this.stacks,
                target: ally,
                fromAttack: false
            });
        });
    }
}
