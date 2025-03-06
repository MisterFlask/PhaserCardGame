import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { RelicsLibrary } from "../../relics/RelicsLibrary";
import { ActionManager } from "../../utils/ActionManager";


class MemoryPurgeChoice extends AbstractChoice {
    constructor() {
        super(
            "Engage in Memory Purge",
            "Remove 2 cards permanently."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The demons' claws sink into your mind, extracting painful memories. The air smells of burnt parchment as your regrets dissolve into the aether.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        // TODO IMPLEMENT: Remove 2 cards permanently
        const relic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        actionManager.addRelicToInventory(relic);
    }
}

class RegretAbsolutionChoice extends AbstractChoice {
    constructor() {
        super(
            "Purchase Regret Absolution",
            "Remove 2 Stress from party members (Costs 25 Denarians)"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "A contract materializes in your hands, its clauses written in shifting infernal script. The weight of your regrets lifts as the document burns away.";
    }

    canChoose(): boolean {
        return this.gameState().sovereignInfernalNotes >= 25;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        actionManager.modifyDenarians(-25);
        for (const character of this.gameState().currentRunCharacters) {
            actionManager.applyBuffToCharacter(character, new Stress(-2));
        }
    }
}


export class FieldsOfRegretEvent extends AbstractEvent {
    public name: string;
    public description: string;
    public choices: AbstractChoice[];

    constructor() {
        super();
        this.name = "The Fields of Eternal Regret";
        this.description = "A desolate plain where damned souls wander aimlessly, their regrets manifesting as swirling mists. Demonic accountants in pinstripe suits offer contracts for absolution.\n\n" +
            "A clerk adjusts their spectacles: [color=white]\"Current regret index at 42.7%. Would you care to discuss our premium absolution packages?\"[/color]";
        this.choices = [new MemoryPurgeChoice(), new RegretAbsolutionChoice()];
    }
} 