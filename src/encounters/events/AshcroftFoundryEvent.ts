import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { RelicsLibrary } from "../../relics/RelicsLibrary";
import { ActionManager } from "../../utils/ActionManager";
class CollectiveForgingChoice extends AbstractChoice {
    constructor() {
        super(
            "Contribute to Shared Armory",
            "Gain a Common relic (Requires 1 Cargo)"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The furnace roars as your materials vanish into shared crucibles. A token emerges stamped with the Foundry's fist-and-gear insignia, still warm from the forge.";
    }

    canChoose(): boolean {
        return true;
    }


    effect(): void {
        const actionManager = ActionManager.getInstance();
        actionManager.removeRandomValuableCargo();
        const relic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        actionManager.addRelicToInventory(relic);
    }
}

class PropagandaPressChoice extends AbstractChoice {
    constructor() {
        super(
            "Run Revolutionary Broadsheets",
            "Gain 100 Promissory Notes (1 Stress)"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Typesetting demons clatter away as your manifesto flows through the presses. The finished sheets smell of ink and righteous fury.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        actionManager.modifyPromissoryNotes(100);
        for (const character of this.gameState().currentRunCharacters) {
            actionManager.applyBuffToCharacter(character, new Stress(1));
        }
    }

}

export class AshcroftFoundryEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "Ashcroft Cooperative Foundry";
        this.description = "A thunderous hall where shared crucibles glow with communal fire. Hammers rise and fall in unison, their rhythm punctuated by shouted verses from The People's Technical Manual.\n\n" + 
            "A foreman wipes soot from their goggles: [color=white]\"From each according to their furnace, to each according to their need! Now hand over those schematics.\"[/color]";
        this.choices = [new CollectiveForgingChoice(), new PropagandaPressChoice()];
    }
} 