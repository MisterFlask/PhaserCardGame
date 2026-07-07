import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { StokersTonic } from "../../consumables/StokersTonic";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { BelphegorsRounds } from "../../relics/rare/BelphegorsRounds";

class PayForAmmoChoice extends AbstractChoice {
    private cost = 80;
    constructor() {
        super(
            "WIRE: Pay £80. Bill the client.",
            "Spend £80 to acquire improved rounds."
        );
        const payoff = new DeadEndEvent();
        payoff.description = "Paid rather than let the creature shoot one of my men. [color=white]\"A discerning customer,\"[/color] it said, handing over a scroll. [color=white]\"Third chamber blessed, fourth cursed. Maintains balance.\"[/color] Steep, but superior rounds.\n" +
            "— Cavendish";
        this.nextEvent = payoff;
    }
    canChoose(): boolean { return true; }
    effect(): void {
        this.actionManager().modifyMoney(-this.cost);
        this.actionManager().addRelicToInventory(new BelphegorsRounds());
    }
}

class AcceptTestChoice extends AbstractChoice {
    private damage = 5;
    constructor() {
        super(
            "WIRE: Volunteer a man. Free ammo.",
            "One soldier suffers 5 damage and gains 2 Stress. Receive double ammunition."
        );
        const payoff = new DeadEndEvent();
        payoff.description = "Double ammunition for one man's discomfort — compelling arithmetic. [color=white]\"Stand there, by that rock,\"[/color] it said. The weapon sounded like a pipe organ being murdered. Thompson screamed, glowing shrapnel in his thigh. Not fatal, apparently. The sigil tossed over a hip flask by way of apology. [color=white]\"For the shakes,\"[/color] it said.\n" +
            "— Cavendish";
        this.nextEvent = payoff;
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const character = this.getEventCharacter(1);
        character.hitpoints = Math.max(1, character.hitpoints - this.damage);
        this.actionManager().applyBuffToCharacter(character, new Stress(2));
        this.actionManager().addRelicToInventory(new BelphegorsRounds(2));
        this.addConsumable(new StokersTonic());
    }
}

class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Decline. Standard issue.",
            "Some deals aren't worth making."
        );
        const payoff = new DeadEndEvent();
        payoff.description = "We've survived this long on Company rounds. [color=white]\"Regulations? In Hell? How delightfully mortal,\"[/color] the sigil said, dimming with disappointment.\n" +
            "— Cavendish";
        this.nextEvent = payoff;
    }
    canChoose(): boolean { return true; }
    effect(): void {}
}

export class ArmsDealerPropositionEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Arms Dealer's Proposition";
        this.portraitName = "placeholder_event_background_1";
        this.description = "DISPATCH — Marsh road.\n" +
            "A tent: [color=white]\"Belphegor's Ballistics.\"[/color] Proprietor's face is a rotating bronze sigil, six arms in a waistcoat. He calls our rounds \"mass-produced rubbish,\" fires his own through a breastplate like paper. [color=white]\"Yours for a price. Or test my hand-cannon on a man — non-fatal — for double stock. Well?\"[/color]\n" +
            "— Cavendish";
        this.choices = [
            new PayForAmmoChoice(),
            new AcceptTestChoice(),
            new DeclineChoice()
        ];
    }
}