import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { ActionManager } from "../../utils/ActionManager";

class CelestialForecastChoice extends AbstractChoice {
    constructor() {
        super(
            "Commission Star Chart",
            "Reveal 3 upcoming encounters (10 Denarians)"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The orrery whirs to life, brass planets tracing impossible orbits. A vellum scroll extrudes from a slit in the machine, its ink still smoking with astral residue.";
    }

    canChoose(): boolean {
        return this.gameState().sovereignInfernalNotes >= 10;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        actionManager.modifyDenarians(-10);
        // TODO IMPLEMENT: Encounter preview logic
    }
}

class PersonalHoroscopeChoice extends AbstractChoice {
    constructor() {
        super(
            "Purchase Natal Chart Reading",
            "Gain 2 random buffs and 1 debuff (Free)"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The astrologer's lenses flip down as copper arms trace your aura. 'Mars in ascension...' they mutter, stamping a wax seal that burns into your ledger.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        // TODO IMPLEMENT: Add random buff/debuff logic
    }
}

export class BlackstoneAstrologicalEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "Blackstone Astrological Society";
        this.description = "A domed observatory where orreries of blackened brass chart courses no sane cosmos would permit. Robed attendants polish lenses that show the past in one eye and possible futures in the other.\n\n" +
            "A scholar adjusts their aetheric calipers: [color=white]\"Our sidereal forecasts account for 83% of infernal trade routes. Consultations available for discrete temporal advantage.\"[/color]";
        this.choices = [new CelestialForecastChoice(), new PersonalHoroscopeChoice()];
    }
} 