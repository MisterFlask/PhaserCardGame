import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { SignalFlare } from "../../consumables/SignalFlare";

class AcceptHisServiceChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Let him preach. Free morale.",
            "Sit through the sermon. All soldiers lose 1 Stress; the sermon runs long."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "His sermon on 'the redemptive potential of quarterly targets' ran ninety unbearable minutes, but the men left it oddly settled, as one does after surviving something together.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const gameState = this.gameState();
        gameState.currentRunCharacters.forEach(character => {
            this.actionManager().applyBuffToCharacter(character, new Stress(-1));
        });
    }
}

class SendHimOnHisWayChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Thank him. Send him onward.",
            "Politely decline the service. Receive his signal flares instead."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "He seemed relieved, honestly — his previous congregation had not survived their sermon. Left us a crate of his old signaling flares as a parting gift, [color=white]\"blessed, probably.\"[/color]\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const flare = new SignalFlare();
        this.addConsumable(flare);
        this.actionManager().displaySubtitle(`Received ${flare.getDisplayName()}`, 2000);
    }
}

export class ChaplainsReplacementEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Replacement Chaplain";
        this.portraitName = "placeholder_event_background_1";
        this.description = "DISPATCH — supply road.\n" +
            "London has dispatched a replacement chaplain, Reverend Ashby-Crull, following Mortwright's unexplained disappearance. He is younger, earnest, and insists on ministering to the men before we proceed. Time is not unlimited. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new AcceptHisServiceChoice(),
            new SendHimOnHisWayChoice()
        ];
    }
}
