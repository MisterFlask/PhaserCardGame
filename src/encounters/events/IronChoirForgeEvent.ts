import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { RelicsLibrary } from "../../relics/RelicsLibrary";
import { ActionManager } from "../../utils/ActionManager";

class ExperimentalAlloyChoice extends AbstractChoice {
    constructor() {
        super(
            "Invest in White-Flame Alloys",
            "Gain 1 Rare Relic; all party members gain 2 Stress"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The crucible glows with unstable energies as metallurgical hymns reach a crescendo. The resulting relic pulses with barely-contained power.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        const relic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        actionManager.addRelicToInventory(relic);
        for (const character of this.gameState().currentRunCharacters) {   
            actionManager.applyBuffToCharacter(character, new Stress(-2));
        }
    }
}


class WorkerSolidarityChoice extends AbstractChoice {
    constructor() {
        super(
            "Support Union Activities",
            "Remove 1 Stress from all party members"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The choir's rhythm shifts to a soothing cadence as workers share stories of solidarity. The oppressive heat of the forge seems to lessen, if only temporarily.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        // TODO IMPLEMENT: Remove stress from all party members
    }
}

export class IronChoirForgeEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "Iron Choir Forgeworks";
        this.description = "A cathedral of industry where metallurgical hymns echo through vaulted chambers. Massive crucibles of molten demonsteel bubble in time with the choir's rhythmic chanting.\n\n" +
            "A priest-overseer's brass throatbox hums: [color=white]\"Our white-flame alloys are 83.7% more efficient than conventional methods. Would you care to invest in our experimental processes?\"[/color]";
        this.choices = [new ExperimentalAlloyChoice(), new WorkerSolidarityChoice()];
    }
} 