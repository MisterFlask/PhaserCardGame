import { AbstractBuff } from "../AbstractBuff";

export class HarbingerOfFate extends AbstractBuff {

    constructor() {
        super();
        this.isDebuff = false;
        this.imageName = "forward-sun";
    }

    override getDisplayName(): string { return "Harbinger of Fate"; }

    override getDescription(): string {
        return "An ill omen that heralds inevitable outcomes.";
    }

    // This buff previously tracked who played Foreseen cards. It now simply marks
    // the prophet as a herald of destiny without additional effects.

    public hasPlayedForeseen(_character: any): boolean { return false; }
}
