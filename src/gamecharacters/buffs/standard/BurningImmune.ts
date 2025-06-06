import { AbstractCard } from "../../AbstractCard";
import { AbstractBuff, BuffApplicationResult } from "../AbstractBuff";
import { Burning } from "./Burning";

export class BurningImmune extends AbstractBuff {
    constructor(){
        super();
        this.isDebuff = false;
        this.imageName = "flame-off";
    }

    override getDisplayName(): string { return "Burning Immune"; }

    override getDescription(): string { return "Immune to Burning."; }

    override interceptBuffApplication(_character: AbstractCard, buffApplied: AbstractBuff, _previous: number, change: number): BuffApplicationResult {
        if (buffApplied instanceof Burning && change > 0) {
            return { logicTriggered: true, newChangeInStacks: 0 };
        }
        return { logicTriggered: false, newChangeInStacks: change };
    }
}
