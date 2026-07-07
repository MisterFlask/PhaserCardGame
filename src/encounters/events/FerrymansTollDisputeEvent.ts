import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";

class OverpayForGoodwillChoice extends AbstractChoice {
    private cost = 20;
    constructor() {
        super(
            "WIRE: Pay double. Buy goodwill.",
            "Overpay the ferryman by £20 for future favor."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "He pocketed the excess without comment, but marked something on his pole in a notch only he'll ever read. [color=white]\"Ferrymen remember,\"[/color] was all he offered. I'll take that as banked goodwill.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return this.gameState().moneyInVault >= this.cost; }
    effect(): void {
        this.actionManager().modifyMoney(-this.cost);
    }
}

class PayStandardFareChoice extends AbstractChoice {
    private cost = 10;
    constructor() {
        super(
            "WIRE: Pay the standard fare.",
            "£10, no more, no less."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Correct change, correct silence. He poled us across the channel without a word, which I've come to understand is the ferrymen's version of a warm welcome.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return this.gameState().moneyInVault >= this.cost; }
    effect(): void {
        this.actionManager().modifyMoney(-this.cost);
    }
}

class HagglChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Haggle. Find another way across.",
            "Refuse to pay and find our own crossing."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "We forded a shallower channel ourselves, losing an hour and most of our dignity to the mud. The ferryman watched from his boat, arms folded, saying absolutely nothing, which was somehow the worst part.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {}
}

export class FerrymansTollDisputeEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Ferryman's Fare";
        this.portraitName = "placeholder_event_background_2";
        this.description = "DISPATCH — Styx Delta, tributary crossing.\n" +
            "A ferryman blocks the only dry crossing for miles, pole planted, expression unreadable. His fare is posted on a warped board, the numbers rewriting themselves faintly whenever I look away. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new OverpayForGoodwillChoice(),
            new PayStandardFareChoice(),
            new HagglChoice()
        ];
    }
}
