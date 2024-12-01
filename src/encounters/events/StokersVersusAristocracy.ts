import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { CinderCourtEsteem, StokersUnionEsteem } from "../../ledger/Esteem";

class SupportStokersChoice extends AbstractChoice {
    constructor() {
        super(
            "Support the Stoker's Union",
            "Gain 1 Esteem with the Stoker's Union, lose 1 Esteem with the Cinder Court"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The grim-faced laborers nod in approval as you take their side. Their leader, a burly demon with coal dust permanently etched into his skin, grasps your hand with calloused fingers. 'The Union remembers its friends,' he growls. 'When the Furnace burns hot and the aristocrats come begging for warmth, we'll remember who stood with us.' The floating obsidian carriages depart in a huff of indignation and brimstone, their occupants already plotting their revenge.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        this.addLedgerItem(new StokersUnionEsteem(1));
        this.addLedgerItem(new CinderCourtEsteem(-1));
    }
}

class SupportAristocracyChoice extends AbstractChoice {
    constructor() {
        super(
            "Side with the Cinder Court",
            "Lose 1 Esteem with the Stoker's Union, gain 1 Esteem with the Cinder Court"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The aristocrats smile thinly as you take their side, their perfect porcelain masks gleaming in the dim light of the idle Furnace. 'How refreshing to find someone who understands progress,' purrs a Duchess through lips stained with brimstone wine. 'These... laborers will learn that they are as replaceable as any other component of Hell's machinery.' The striking workers depart with murderous glares and muttered curses that leave scorch marks on the ground.";
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
        super("Attempt to mediate the dispute",
            "Nothing happens."
        );        
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Hours of tense negotiation follow, punctuated by bursts of hellfire and the occasional shattering of priceless porcelain masks. You manage to broker an uneasy compromise: the Stoker's Union will accept limited automation in exchange for ownership stakes in the new machinery and guaranteed positions maintaining the Styx turbines. Neither side is entirely pleased - the aristocrats sneer at having to negotiate with 'mere laborers,' while the Union representatives grumble about the march of progress. Still, the Furnace roars back to life, and Hell remains unfrozen... for now."      

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
        this.name = "Labor Dispute at the Furnace";
        this.description = "You find yourself in the sweltering heart of Dis, where the great Furnace that keeps Hell from freezing stands silent. The Stoker's Union has called a strike, demanding better working conditions and protection from new Styx turbine technology. Members of the Cinder Court have arrived in their floating obsidian carriages, threatening to replace the workers with automated solutions from the Clockwork Wastes.\n\nThe air crackles with tension - and not just from the static discharge of idle Maxwell coils. Both sides eye you with interest, clearly hoping to sway you to their cause.";
        this.choices = []
        this.choices.push(new SupportStokersChoice());
        this.choices.push(new SupportAristocracyChoice());
        this.choices.push(new MediateChoice());
    }
}
