import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { RelicsLibrary } from "../../relics/RelicsLibrary";
import { ActionManager } from "../../utils/ActionManager";

class MassProductionChoice extends AbstractChoice {
    constructor() {
        super(
            "Contract Bulk Production",
            "Duplicate a random common relic in your inventory"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Assembly lines roar to life, stamping out identical relics with brutal efficiency. The items bear subtle manufacturing flaws, but their quantity compensates.";
    }

    canChoose(): boolean {
        return false;
    }


    effect(): void {

        const gameState = this.gameState();
        const commonRelics = gameState.relicsInventory.filter(relic => relic.rarity === EntityRarity.COMMON);
        const relic = commonRelics.length > 0 
            ? commonRelics[Math.floor(Math.random() * commonRelics.length)].clone()
            : RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        const actionManager = ActionManager.getInstance();
        actionManager.addRelicToInventory(relic);
    }
}


class EspionageChoice extends AbstractChoice {
    constructor() {
        super(
            "Commission Industrial Espionage",
            "Steal a Rare Relic Design (50 Denarians)"
        );

        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Shadowy figures deliver schematics still warm from a rival forge. The plans dissolve if examined too closely, but not before your engineers replicate them.";
    }

    canChoose(): boolean {
        return this.gameState().sovereignInfernalNotes >= 50;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        actionManager.modifySovereignInfernalNotes(-50);
        const relic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        actionManager.addRelicToInventory(relic);
    }
}

export class DisManufacturingEvent extends AbstractEvent {
    public name: string;
    public description: string;
    public choices: AbstractChoice[];

    constructor() {
        super();
        this.name = "Dis Manufacturing Annex";
        this.description = "A cavernous factory complex where assembly lines stretch into the smoky distance. Pneumatic hammers beat a relentless cadence as identical infernal devices roll off conveyor belts.\n\n" +
            "A foreman blows a steam whistle: [color=white]\"Standardized production protocols in effect! All craftsdæmonship signs must be filed off prior to quality control!\"[/color]";
        this.choices = [new MassProductionChoice(), new EspionageChoice()];
    }
} 