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
        payoff.description = "The thought of letting this thing shoot one of my men turned my stomach. Better to pay and be done with it.\n\n" +
            "[color=white]\"Excellent! A discerning customer.\"[/color]\n\n" +
            "The price was steep, but the ammunition was undeniably superior. Each cartridge gleamed with purpose.\n\n" +
            "[color=white]\"Loading instructions,\"[/color] he said, handing over a scroll. [color=white]\"Load them sunrise-to-sunset, never widdershins. Third chamber blessed, fourth cursed. Maintains balance.\"[/color]";
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
        payoff.description = "Double ammunition for one man's temporary discomfort? The arithmetic was compelling. In Hell, ethics were a luxury I couldn't afford.\n\n" +
            "[color=white]\"Marvelous! Stand there, my good man. By that rock.\"[/color]\n\n" +
            "The weapon made a sound like a pipe organ being murdered. Thompson screamed, clutching his thigh where something glowing had lodged itself.\n\n" +
            "[color=white]\"Fascinating! Note how he's not bleeding out? Magnificent.\"[/color]";
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
        payoff.description = "I looked at the weapon, my nervous men, and the impressive ammunition. We'd survived this long with Company rounds. We could survive longer.\n\n" +
            "[color=white]\"Regulations? In Hell? How delightfully... mortal.\"[/color] The sigil dimmed with disappointment.";
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
        this.description = "Morrison spotted it while we cleared marsh weed - a proper shop tent with a sign: [color=white]\"Belphegor's Ballistics - Ammunition for the Discriminating Marksman.\"[/color]\n\n" +
            "The proprietor emerged before we could flee. Where his face should have been, a pentagonal bronze sigil rotated slowly. Six arms protruded from a merchant's waistcoat.\n\n" +
            "[color=white]\"Company men! Still using those dreadful standard-issue revolvers? Shocking.\"[/color]\n\n" +
            "He produced one of our cartridges from Thompson's pouch. [color=white]\"Mass-produced rubbish! How do you expect to stop anything substantial with these?\"[/color]\n\n" +
            "He showed another cartridge, gleaming with inner fire. [color=white]\"THIS is ammunition. Hand-crafted. Guaranteed to punch through infernal hide or bureaucratic immunity.\"[/color] He fired at a breastplate; it punched through like paper.\n\n" +
            "[color=white]\"Yours for a reasonable price. Or, if liquidity is an issue - let me test my new hand-cannon on one of your men. Non-fatal. In exchange, double ammunition. What say you?\"[/color]";
        this.choices = [
            new PayForAmmoChoice(),
            new AcceptTestChoice(),
            new DeclineChoice()
        ];
    }
}