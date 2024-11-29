import { AbstractChoice, AbstractEvent } from "../../events/AbstractEvent";
import { GameState } from "../../rules/GameState";

class SupportStokersChoice extends AbstractChoice {
    constructor() {
        super("Support the Stoker's Union");
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        // Add reputation with Stokers, lose reputation with Aristocracy
    }
}

class SupportAristocracyChoice extends AbstractChoice {
    constructor() {
        super("Side with the Cinder Court");
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        // Add reputation with Aristocracy, lose reputation with Stokers
    }
}

class MediateChoice extends AbstractChoice {
    constructor() {
        super("Attempt to mediate the dispute");
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        // Small reputation gain with both factions
        GameState.instance.addGold(25); // Token of appreciation from both sides
    }
}

export class StokersVersusAristocracy extends AbstractEvent {
    constructor() {
        super();
        this.name = "Labor Dispute at the Furnace";
        this.portraitName = "furnace_dispute";
        this.description = "You find yourself in the sweltering heart of Dis, where the great Furnace that keeps Hell from freezing stands silent. The Stoker's Union has called a strike, demanding better working conditions and protection from new Styx turbine technology. Members of the Cinder Court have arrived in their floating obsidian carriages, threatening to replace the workers with automated solutions from the Clockwork Wastes.\n\nThe air crackles with tension - and not just from the static discharge of idle Maxwell coils. Both sides eye you with interest, clearly hoping to sway you to their cause.";
        
        this.choices.push(new SupportStokersChoice());
        this.choices.push(new SupportAristocracyChoice());
        this.choices.push(new MediateChoice());
    }
}
