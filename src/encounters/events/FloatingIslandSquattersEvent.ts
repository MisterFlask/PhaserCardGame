import { AbstractChoice, AbstractEvent, DeadEndEvent, DeadEndStartEncounterChoice } from "../../events/AbstractEvent";
import { Encounter } from "../EncounterManager";
import { Brigand } from "../monsters/act1_segment1/act1_segment0/Brigand";
import { AbstractRelic } from "../../relics/AbstractRelic";
import { RelicsLibrary } from "../../relics/RelicsLibrary";

class NegotiatePassageChoice extends AbstractChoice {
    private cost = 30;
    constructor() {
        super(
            "WIRE: Pay £30 passage.",
            "Pay the squatters' toll to cross their bone-island bridge."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "They lowered a gangplank of lashed femurs without much ceremony. Their headwoman took the coin and spat over the rail, which I gather is the local sign of a completed transaction.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return this.gameState().moneyInVault >= this.cost; }
    effect(): void {
        this.actionManager().modifyMoney(-this.cost);
    }
}

class ClearThemOffChoice extends DeadEndStartEncounterChoice {
    private selectedRelic: AbstractRelic | null = null;
    constructor() {
        const dummyEncounter = new Encounter([], 0, 0);
        super(
            "WIRE: Clear the island. Take it.",
            dummyEncounter,
            "Fight for passage. The island's cargo looks worth salvaging."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "They fought like people with nowhere else to live, which is to say, hard. We took the island anyway and found a strongbox wedged in the bone-lattice, evidently theirs, now ours.\n" +
            "— Cavendish";
    }
    init(): void {
        this.selectedRelic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        this.mechanicalInformationText = "Combat will ensue. Gain " + this.selectedRelic.getDisplayName() + " as a reward.";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        this.encounter.enemies = [new Brigand(), new Brigand()];
        this.encounter.act = this.gameState().currentAct;
        this.encounter.segment = 0;
        const relicToAdd = this.selectedRelic;
        super.effect();
        if (relicToAdd) {
            this.addLedgerItem(relicToAdd);
            this.actionManager().displaySubtitle(`Received ${relicToAdd.getDisplayName()}`, 2000);
        }
    }
}

class GoAroundChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Go around. Long way.",
            "Add distance rather than trouble."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "An extra two hours of mangrove and mud, but nobody shot at us, which I've learned to count as a successful sortie in its own right.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {}
}

export class FloatingIslandSquattersEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Bone-Island Squatters";
        this.portraitName = "placeholder_event_background_2";
        this.description = "DISPATCH — Styx Delta, open water.\n" +
            "A floating island of lashed bone and driftwood blocks the only dry crossing, occupied by a clan who've built a fair little village up top. They want toll for the bridge. Their headwoman looks entirely capable of enforcing it. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new NegotiatePassageChoice(),
            new ClearThemOffChoice(),
            new GoAroundChoice()
        ];
    }
}
