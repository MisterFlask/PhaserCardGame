import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { BelphegorsRounds } from "../../relics/rare/BelphegorsRounds";

class PayForAmmoChoice extends AbstractChoice {
    private cost = 80;
    constructor() {
        super(
            "Pay for the Ammunition",
            "Spend 80 Hell Currency to acquire improved rounds."
        );
        const payoff = new DeadEndEvent();
        payoff.description = "The thought of letting this thing shoot one of my men - even \"non-fatally\" - turned my stomach. Besides, what use is a wounded soldier in this hellscape? Better to pay and be done with it.\n\n" +
            "[color=white]\"Excellent! A discerning customer. Let me prepare your order.\"[/color]\n\n" +
            "The price was steep - devilish, one might say - but the ammunition was undeniably superior. Each box was wrapped in waxed paper covered with cramped writing in languages I didn't recognize. The cartridges themselves were works of art, gleaming with purpose.\n\n" +
            "[color=white]\"Loading instructions,\"[/color] the devil explained, handing over a scroll. [color=white]\"Very important. Load them sunrise-to-sunset, never widdershins. The third chamber should always contain a blessed round, the fourth a cursed one. Maintains balance, you understand.\"[/color]";
        this.nextEvent = payoff;
    }
    canChoose(): boolean { return true; }
    effect(): void {
        this.actionManager().modifySovereignInfernalNotes(-this.cost);
        this.actionManager().addRelicToInventory(new BelphegorsRounds());
    }
}

class AcceptTestChoice extends AbstractChoice {
    private damage = 5;
    constructor() {
        super(
            "Accept the Test",
            "One soldier suffers 5 damage and gains 2 Stress. Receive double ammunition."
        );
        const payoff = new DeadEndEvent();
        payoff.description = "Double ammunition for the price of one man's temporary discomfort? The arithmetic was compelling, even if the ethics were questionable. And in Hell, ethics were a luxury I couldn't afford.\n\n" +
            "[color=white]\"Marvelous! Oh, this will provide such useful data. If you would just stand there, my good man. Yes, by that rock. Perfect.\"[/color]\n\n" +
            "The weapon made a sound like a pipe organ being murdered. Thompson screamed and spun to the ground, clutching his thigh where something glowing and unpleasant had lodged itself.\n\n" +
            "[color=white]\"Fascinating!\"[/color] The devil was already taking notes. [color=white]\"The penetration is less than expected, but the cauterization feature works perfectly. Note how he's not bleeding out? Magnificent.\"[/color]";
        this.nextEvent = payoff;
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const character = this.getEventCharacter(1);
        character.hitpoints = Math.max(1, character.hitpoints - this.damage);
        this.actionManager().applyBuffToCharacter(character, new Stress(2));
        this.actionManager().addRelicToInventory(new BelphegorsRounds(2));
    }
}

class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "Decline and Leave",
            "Some deals aren't worth making."
        );
        const payoff = new DeadEndEvent();
        payoff.description = "I looked at the devil's experimental weapon, at my nervous men, and at the admittedly impressive ammunition. The calculation was simple: we'd survived this long with Company rounds. We could survive a bit longer.\n\n" +
            "[color=white]\"Regulations? In Hell? How delightfully... mortal of you.\"[/color] The sigil dimmed with disappointment.";
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
        this.description = "We'd stopped to clear marsh weed from the crawler's intake when Morrison spotted it - a proper shop tent, complete with display cases and a painted sign: [color=white]\"Belphegor's Ballistics - Ammunition for the Discriminating Marksman.\"[/color]\n\n" +
            "The proprietor emerged before we could decide whether to investigate or flee. Where his face should have been, a pentagonal bronze sigil rotated slowly, each facet reflecting our images in disturbing ways. He wore a leather apron over what might have been a merchant's waistcoat, if merchants typically had six arms.\n\n" +
            "[color=white]\"Gentlemen! Company men, I perceive! Still using those dreadful standard-issue revolvers, no doubt? Shocking. Positively shocking.\"[/color]\n\n" +
            "Before I could respond, he'd produced one of our cartridges from thin air - or possibly from Thompson's ammunition pouch. [color=white]\"Look at this! Mass-produced. Inconsistent powder loads. The bullets aren't even properly blessed! How do you expect to stop anything more substantial than a disgruntled clerk with these?\"[/color]\n\n" +
            "He produced another cartridge, gleaming with inner fire. [color=white]\"Now THIS is ammunition. Each round hand-crafted. Guaranteed to punch through infernal hide, spectral armor, or bureaucratic immunity. Observe.\"[/color] He fired at a breastplate; the bullet punched through like paper.\n\n" +
            "[color=white]\"Impressive, no? I can offer you a supply at very reasonable rates. Of course, if liquidity is an issue, I have an alternative arrangement. A new model of hand-cannon, purely theoretical. One shot, non-fatal, on one of your men. In exchange, double the ammunition. What say you?\"[/color]";
        this.choices = [
            new PayForAmmoChoice(),
            new AcceptTestChoice(),
            new DeclineChoice()
        ];
    }
}
