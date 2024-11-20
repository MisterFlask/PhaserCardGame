import { BaseCharacter } from "../../BaseCharacter";
import { LocationCardBuff } from "../LocationCardBuff";

export class RockSlides extends LocationCardBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = true;
    }

    override getName(): string {
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
