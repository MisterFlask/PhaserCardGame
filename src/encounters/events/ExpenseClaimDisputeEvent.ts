import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { TraumaLibrary } from "../../gamecharacters/statuses/curses/traumas/TraumaLibrary";

class ForgeTheReceiptsChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Forge the receipts. Claim it all.",
            "Gain £35. Risk a curse if Jenkins' handwriting is recognized."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Jenkins forged a passable set of receipts, and London paid out without comment — this time. A note in the margin, though, in a hand that wasn't his, reading only [color=white]\"we know.\"[/color]\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        this.actionManager().modifyMoney(35);
        if (Math.random() < 0.4) {
            const curse = TraumaLibrary.getRandomTrauma();
            this.actionManager().addCardToMasterDeck(curse);
            this.actionManager().displaySubtitle(`Received curse: ${curse.name}`, 2000);
        }
    }
}

class SubmitHonestlyChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Submit honestly. Take the loss.",
            "Claim only what's documented. Gain £15."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "A modest, entirely truthful claim, processed without incident. London remains unaware that honesty is even an option most sorties.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        this.actionManager().modifyMoney(15);
    }
}

export class ExpenseClaimDisputeEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Expense Claim";
        this.portraitName = "placeholder_event_background_2";
        this.description = "MARGINAL NOTE, expense claim.\n" +
            "This quarter's receipts are, charitably, incomplete — several items catalogued only as \"miscellaneous, urgent.\" Jenkins offers to fill in the gaps creatively. London's accountants are not known for their sense of humor. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new ForgeTheReceiptsChoice(),
            new SubmitHonestlyChoice()
        ];
    }
}
