import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { StokersTonic } from "../../consumables/StokersTonic";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";

class AcceptTheOldGuardFavorChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Accept the honor. Salute back.",
            "A grenadier corpse presents arms. One man gains 3 Stress; gain a tonic."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "It saluted with a hand that had no business still articulating, pressed a hip flask into Thompson's grip, and returned to its post without another word. Thompson hasn't blinked since. The flask, at least, is excellent.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const character = this.getEventCharacter(1);
        this.actionManager().applyBuffToCharacter(character, new Stress(3));
        this.addConsumable(new StokersTonic());
    }
}

class MarchOnChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: March on. Don't engage.",
            "The Emperor's men keep their own counsel; so shall we."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "We filed past at a respectful distance. It tracked us with eyes long since gone to glass, then resumed staring at a horizon that has not changed since 1815. Some wars simply forget to end.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {}
}

export class EmperorUndyingConscriptEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Old Guard's Salute";
        this.portraitName = "placeholder_event_background_2";
        this.description = "DISPATCH — Deep France, forward picquet.\n" +
            "A Grand Armée grenadier, dead a full century by his uniform, stands sentry at a crossroads that leads nowhere in particular. He recognizes our crawler as \"materiel\" and offers the honors due a fellow logistics concern. Declining might be read as an insult. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new AcceptTheOldGuardFavorChoice(),
            new MarchOnChoice()
        ];
    }
}
