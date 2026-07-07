import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { EcclesiasticalRecommendation } from "../../relics/special/EcclesiasticalRecommendation";

class HumorHimChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Humor him. Let him \"help.\"",
            "Give the nephew something harmless to do. One man gains 2 Stress."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Young Pettigrew-Ashworth \"supervised\" from a safe distance while narrating our efforts into a notebook for his uncle. Hutchinson's left eyelid has developed a tic. The boy seemed thrilled regardless.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const character = this.getEventCharacter(1);
        this.actionManager().applyBuffToCharacter(character, new Stress(2));
        const writ = new EcclesiasticalRecommendation();
        this.addLedgerItem(writ);
        this.actionManager().displaySubtitle(`Received ${writ.getDisplayName()}`, 2000);
    }
}

class PayHimOffChoice extends AbstractChoice {
    private cost = 20;
    constructor() {
        super(
            "WIRE: Pay him £20 to observe from the crawler.",
            "Bribe him to stay put and out of the way."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "He accepted with the easy grace of a young man who has never once had to earn anything, and spent the sortie sketching the scenery. Cheap, as these arrangements go.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return this.gameState().moneyInVault >= this.cost; }
    effect(): void {
        this.actionManager().modifyMoney(-this.cost);
    }
}

class PutHimToWorkChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Put him to work. Real work.",
            "Assign him actual duties. Gain £15 from his uncle's gratitude."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "He carried crates until his gloves wore through, said not one word of complaint, and wrote his uncle a glowing report of Company discipline. The old man wired us a small bonus. Unexpected, on both counts.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        this.actionManager().modifyMoney(15);
    }
}

export class ShareholdersNephewEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Shareholder's Nephew";
        this.portraitName = "placeholder_event_background_1";
        this.description = "MARGINAL NOTE, expense claim.\n" +
            "Young Pettigrew-Ashworth has been foisted upon us for \"field experience,\" per his uncle's letter of introduction — the uncle in question owning rather a lot of Company stock. He is enthusiastic, useless, and watching me expectantly. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new HumorHimChoice(),
            new PayHimOffChoice(),
            new PutHimToWorkChoice()
        ];
    }
}
