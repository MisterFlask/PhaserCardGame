/**
 * Cavendish dispatch: a Dutch field hospital in the Badlands wants to
 * infect one of the men with the "ashen flux" in trade for an artifact.
 */

import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { AbstractRelic } from "../../relics/AbstractRelic";
import { RelicsLibrary } from "../../relics/RelicsLibrary";
import { ActionManager } from "../../utils/ActionManager";
import { getRandomHellDisease } from "./event_buffs/HellDiseases";

class AcceptDiseaseChoice extends AbstractChoice {
    private selectedRelic: AbstractRelic | null = null;

    constructor() {
        super(
            "WIRE: Volunteer a man.",
            "For science, as they say."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Selected Hutchinson — he'd been complaining anyway. [color=white]\"Zeer goed!\"[/color] The needles writhed like living things; he's sweating and glassy-eyed now. [color=white]\"Only occasionally fatal,\"[/color] they assured me. Relic's warm to the touch. Fair trade, I'm calling it.\n" +
            "— Cavendish";
    }

    init(): void {
        // Select a relic when the choice is initialized
        this.selectedRelic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        this.mechanicalInformationText = "For science, as they say."
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const gameState = this.gameState();
        const character = this.getEventCharacter(1);
        const actionManager = ActionManager.getInstance();
        
        // Apply random disease debuff
        const diseaseBuff = getRandomHellDisease(1);
        actionManager.applyBuffToCharacter(character, diseaseBuff);
        
        // Add the selected relic to inventory
        if (this.selectedRelic) {
            this.actionManager().addRelicToInventory(this.selectedRelic);
            actionManager.displaySubtitle(`Received ${this.selectedRelic.getDisplayName()}`, 2000);
        }
        
        // Display what disease was contracted
        actionManager.displaySubtitle(`Contracted ${diseaseBuff.getDisplayName()}`, 2000);
    }
}

class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Refuse. Move on.",
            "Your father always told you never to trust a man in clogs."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Cited regulations. [color=white]\"A shame,\"[/color] the clogger said, noting it in his ledger. [color=white]\"Ve will find other volunteers.\"[/color] They struck camp with unsettling speed and marched off in step.\n" +
            "— Cavendish";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {}
}

export class DiseaseForMoneyEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Cloggers Want A Body";
        this.portraitName = "placeholder_event_background_1";
        this.description = "DISPATCH — Brimstone Badlands.\n" +
            "Dutch field hospital, unnervingly tidy. Their leader wants to infect one of my men with something called the ashen flux, [color=white]\"highly educational,\"[/color] in trade for an artifact glowing with concentrated damnation. [color=white]\"Almost entirely survivable,\"[/color] he adds. Instructions?\n" +
            "— Cavendish";
        
        this.choices = [
            new AcceptDiseaseChoice(),
            new DeclineChoice()
        ];
    }
}

