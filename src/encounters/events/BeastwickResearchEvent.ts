import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { RelicsLibrary } from "../../relics/RelicsLibrary";
import { ActionManager } from "../../utils/ActionManager";

class HybridizationChoice extends AbstractChoice {
    constructor() {
        super(
            "Request Hybridization Protocol",
            "Gain a random Beastwick relic (Uncommon) and 1 Stress"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The lab's genetic vats bubble ominously as technicians inject strange serums. You receive a containment capsule emitting bestial growls, its surface stamped with the Beastwick & Co. crest.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        const relic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        actionManager.addRelicToInventory(relic);
        for (const character of this.gameState().currentRunCharacters) {
            actionManager.applyBuffToCharacter(character, new Stress(1));
        }
    }
}


class ContainmentConsultChoice extends AbstractChoice {
    constructor() {
        super(
            "Purchase Containment Blueprints (Costs 25 Denarians)",
            "Upgrade a random card in your deck"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Engineers install pulsating containment fields around your deck. Cards occasionally shimmer with restrained energy, their effects subtly enhanced.";
    }

    canChoose(): boolean {
        return this.gameState().sovereignInfernalNotes >= 25;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        actionManager.modifySovereignInfernalNotes(-25);
        // TODO IMPLEMENT: Card upgrade logic
    }
}

export class BeastwickResearchEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "Beastwick Research Annex";
        this.description = "A labyrinth of humming genetic vats and shrieking containment cells. Technicians in hazard suits monitor scrolling DNA sequences that twist like living things. The air smells of ozone and primordial soup.\n\n" +
            "A lab-coated executive materializes via hologram: [color=white]\"Specimen augmentation services available. Beastwick & Co. accepts no liability for spontaneous speciation events.\"[/color]";
        this.choices = [new HybridizationChoice(), new ContainmentConsultChoice()];
    }
} 