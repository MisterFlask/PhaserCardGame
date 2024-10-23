import { IBaseCharacter } from "../../IBaseCharacter";
import { AbstractBuff } from "../AbstractBuff";
import { Devil } from "./Devil";
import { Eldritch } from "./Eldritch";

export class Holy extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "holy";
        this.stackable = false;
        this.isDebuff = false;
        this.stacks = stacks;
    }

    override getName(): string {
        return "Holy";
    }

    override getDescription(): string {
        return `Deals 50% additional damage to Devils and Eldritch enemies.  Deals no damage to Holy enemies.`;
    }

    override getAdditionalPercentCombatDamageDealtModifier(target?: IBaseCharacter): number {
        if (target && (target.buffs.some(buff => buff instanceof Devil) || target.buffs.some(buff => buff instanceof Eldritch))) {
            return 50;
        }
        if (target && target.buffs.some(buff => buff instanceof Holy)) {
            return -100; // Reduces damage to 0 for Holy targets
        }
        return 0;
    }
}
