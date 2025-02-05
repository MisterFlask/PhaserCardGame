import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { RelicsLibrary } from "../../relics/RelicsLibrary";
import { ActionManager } from "../../utils/ActionManager";

class CargoDonationChoice extends AbstractChoice {
    constructor() {
        super(
            "Donate Cargo to the Commune",
            "Gain 1 Common Relic and 1 Reputation (1 Cargo)"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The commune members cheer as your cargo is unloaded. A relic is pressed into your hands, still warm from the forge.";
    }

    canChoose(): boolean {
        return this.gameState().cargoHolder.cardsInMasterDeck.length > 0;
    }


    effect(): void {
        const actionManager = ActionManager.getInstance();
        actionManager.removeRandomValuableCargo();
        const relic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        actionManager.addRelicToInventory(relic);
        // TODO IMPLEMENT: Add reputation
    }
}

class TribunalChoice extends AbstractChoice {
    constructor() {
        super(
            "Face the People's Tribunal",
            "Gain Collectivized Suffering (If Reputation < 0)"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The tribunal's gavel falls with a thunderous crack. You're handed a relic that hums with the collective pain of the oppressed.";
    }

    canChoose(): boolean {
        //todo
        return true;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        const relic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        actionManager.addRelicToInventory(relic);
    }

}

export class AshenCommuneEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Ashen Commune";
        this.description = "A sprawling shantytown where the damned eke out a meager existence. The air smells of brimstone and desperation, but there's a strange sense of solidarity.\n\n" +
            "A commune leader steps forward: [color=white]\"From each according to their ability, to each according to their need. Will you contribute to our cause?\"[/color]";
        this.choices = [new CargoDonationChoice(), new TribunalChoice()];
    }
} 