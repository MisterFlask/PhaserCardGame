import { BasicProcs } from "../../procs/BasicProcs";
import { AbstractBuff } from "../AbstractBuff";

export class SacrificeBuff extends AbstractBuff {
    constructor() {
        super();
        this.imageName = "sacrifice";
        this.isDebuff = false;
    }

    override getName(): string {
        return "Sacrifice";
    }

    override getDescription(): string {
        return "Exhaust the rightmost other card in your hand when you play this card.";
    }

    override onThisCardInvoked(): void {
            BasicProcs.getInstance().SacrificeACardOtherThan(this.getOwnerAsPlayableCard()!);
        }
    }
}
