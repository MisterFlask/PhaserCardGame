import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { CinderCourtEsteem, StokersUnionEsteem } from "../../ledger/Esteem";

class SupportStokersChoice extends AbstractChoice {
    constructor() {
        super(
            "Support the Stoker's Union",
            "Gain 1 Esteem with the Stoker's Union, lose 1 Esteem with the Cinder Court"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The Union representatives, their faces permanently etched with coal dust and metaphysical scorch marks, nod grimly. Their shop steward, a stocky figure whose brass-buckled overalls bear the marks of countless shifts, grasps your hand. 'Right proper of you to stand with the workers,' he growls. 'When them fancy porcelain-faces need their next shipment rushed through, we'll remember who understood the true value of proper furnace-craft.' The aristocrats depart in their obsidian vehicles, leaving behind only the acrid scent of brimstone wine and carefully worded threats about 'supply chain optimization.'";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        this.addLedgerItem(new StokersUnionEsteem(1));
        this.addLedgerItem(new CinderCourtEsteem(-1));
        this.addRelic(new StokerUnionRelic());

    }
}

class SupportAristocracyChoice extends AbstractChoice {
    constructor() {
        super(
            "Side with the Cinder Court",
            "Lose 1 Esteem with the Stoker's Union, gain 1 Esteem with the Cinder Court"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The Cinder Court representatives adjust their immaculate porcelain masks, a subtle gesture that somehow conveys both approval and condescension. 'How gratifying to encounter an individual who comprehends the inevitability of progress,' purrs a minor Duchess, her voice harmonizing unsettlingly with your land-crawler's Maxwell coils. 'These... laborers... must learn that Hell's logistics network has evolved beyond their primitive loading techniques.' The striking workers depart, their muttered imprecations leaving geometric burn patterns in the iron floor that will take weeks to buff out.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        this.addLedgerItem(new StokersUnionEsteem(-1));
        this.addLedgerItem(new CinderCourtEsteem(1));
    }
}

class MediateChoice extends AbstractChoice {
    constructor() {
        super(
            "Attempt to mediate the dispute",
            "Nothing happens."
        );        
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "After six hours of increasingly non-Euclidean negotiations in the depot's break room, punctuated by bursts of white-flame distillate and the occasional shattering of a decorative porcelain mask, you manage to broker what the paperwork will designate as 'Loading Dock Accord #2,847.' The Stoker's Union agrees to limited implementation of automated loading mechanisms, provided they receive both maintenance contracts and a modest share in something called 'temporal efficiency credits.' The aristocrats, while visibly pained at having to acknowledge the existence of organized labor, recognize that even automated cranes require someone to whisper the proper incantations to the machinery. The depot's Maxwell coils return to their normal hum, though the patterns in their discharge will require standard documentation by British engineers.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
    }
}

export class StokersVersusAristocracy extends AbstractEvent {
    constructor() {
        super();
        this.name = "Form LC-23: Loading Dock Labor Dispute";
        this.description = "You encounter a situation requiring standard intervention at Third Circle Company's Depot #411. Local representatives of the Stoker's Union (ref. Labor Contract 666-B) have initiated an unscheduled work stoppage, citing concerns regarding the implementation of experimental auto-loading mechanisms (British Patent Pending).\n\nA minor delegation from the Cinder Court has arrived via gravity-defying obsidian transport, brandishing both efficiency reports and prototype automata sourced from the Clockwork Wastes. The ambient temperature has risen to concerning levels, and the depot's Maxwell coils are emitting discordant harmonics that suggest imminent temporal inefficiencies.\n\nYour attention to this matter is requested, as per Company Policy regarding standard labor-aristocratic mediation procedures.";
        this.choices = []
        this.choices.push(new SupportStokersChoice());
        this.choices.push(new SupportAristocracyChoice());
        this.choices.push(new MediateChoice());
    }
}
