import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";

class TailoringChoice extends AbstractChoice {
    constructor() {
        super(

            "Commission Bespoke Armor",
            "Upgrade your armor"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Mechanical looms weave infernal silks into impossible geometries. The resulting garment shifts to perfectly counter recent threats.";
    }

    canChoose(): boolean {
        return false;
    }


    effect(): void {
        //const actionManager = ActionManager.getInstance();
        //actionManager.removeCargo(1);
        // TODO IMPLEMENT: Armor upgrade logic
    }
}

class TextileFuturesChoice extends AbstractChoice {
    constructor() {
        super(
            "Invest in Synthetic Weave Futures",
            "In future runs, gain an Abyssal Weave whenever you visit a Loomwright location."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Brokers shout fiber content ratios as ghostly looms materialize. The cards you receive hum with latent potential, their edges trimmed in glowing thread.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        //const actionManager = ActionManager.getInstance();
        //const cards = CardLibrary.getInstance().getRandomSelectionOfRelevantClassCards(3);
        //cards.forEach(card => actionManager.addCardToDeck(card));
        //actionManager.applyBuffToParty(new Stress(1));
    }
}



export class LoomwrightGarmentEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "Loomwright Garment District";
        this.description = "A cavernous textile mill where spectral looms weave fabrics from damned souls' regrets. Rolling racks display armor that shifts patterns to match your gaze.\n\n" + 
            "A foreman shouts over the din: [color=white]\"Protection tailored to your paranoias! Limited-time offer on abyssal silk!\"[/color]";
        this.choices = [new TailoringChoice(), new TextileFuturesChoice()];
    }
} 