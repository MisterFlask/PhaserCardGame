import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { TraumaLibrary } from "../../gamecharacters/statuses/curses/traumas/TraumaLibrary";
import { EcclesiasticalRecommendation } from "../../relics/special/EcclesiasticalRecommendation";

class SubtleCheatChoice extends AbstractChoice {
    private goldReward = 50;
    constructor() {
        super(
            "WIRE: Play it quiet. Palm cards.",
            "Use marked cards and card counting. Gain £50."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Palmed cards from the spare deck, won just enough to show profit without pattern. [color=white]\"Remarkable luck tonight,\"[/color] Mortwright observed. [color=white]\"The Lord smiles upon men of... particular talents.\"[/color]\n" +
            "— Cavendish";
    }

    canChoose(): boolean { return true; }

    effect(): void {
        this.actionManager().modifyMoney(this.goldReward);
        this.actionManager().displaySubtitle(`Gained £${this.goldReward}`, 2000);
    }
}

class BrazenCheatChoice extends AbstractChoice {
    private goldReward = 100;
    constructor() {
        super(
            "WIRE: Cheat openly. Take it all.",
            "Stack the deck openly for £100. Gain a random curse."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Stacked the deck with no pretense of subtlety, cleaned out the collection plate. Mortwright's collar lit unchristian green. [color=white]\"May your cards turn to ash! May bureaucrats question every document you present!\"[/color] Gold's gold.\n" +
            "— Cavendish";
    }

    canChoose(): boolean { return true; }

    effect(): void {
        const curse = TraumaLibrary.getRandomTrauma();
        this.actionManager().addCardToMasterDeck(curse);
        this.actionManager().displaySubtitle(`Received curse: ${curse.name}`, 2000);
        this.actionManager().modifyMoney(this.goldReward);
        this.actionManager().displaySubtitle(`Gained £${this.goldReward}`, 2000);
    }
}

class AbstainChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Abstain. Decline politely.",
            "Politely decline. Receive a Bureaucratic writ."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Declined, citing regulations. Mortwright, unbothered, produced a [color=white]\"Letter of Ecclesiastical Recommendation\"[/color] instead — moral character certified by several denominations I'm fairly sure don't exist. Useful paperwork, at least.\n" +
            "— Cavendish";
    }

    canChoose(): boolean { return true; }

    effect(): void {
        const writ = new EcclesiasticalRecommendation();
        this.addLedgerItem(writ);
        this.actionManager().displaySubtitle(`Received ${writ.getDisplayName()}`, 2000);
    }
}

export class GamblingChaplainEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Gambling Chaplain";
        this.portraitName = "placeholder_event_background_2";
        this.description = "DISPATCH — marsh chapel.\n" +
            "St. Belzebub's, Chaplain Mortwright presiding, collar bearing symbols that aren't regulation crosses. Service concludes with a friendly wager. His cards rearrange themselves when unwatched; I've spotted a spare deck under his prayer book. Question isn't whether to cheat — how boldly?\n" +
            "— Cavendish";
        this.choices = [
            new SubtleCheatChoice(),
            new BrazenCheatChoice(),
            new AbstainChoice()
        ];
    }
}
