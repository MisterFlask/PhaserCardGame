import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Weak } from "../../gamecharacters/buffs/standard/Weak";
import { AbstractRelic } from "../../relics/AbstractRelic";
import { RelicsLibrary } from "../../relics/RelicsLibrary";

class AcceptCryoGearChoice extends AbstractChoice {
    private selectedRelic: AbstractRelic | null = null;
    constructor() {
        super(
            "WIRE: Accept the gear. Sign nothing.",
            "Take the cryo-kit. One man gains Weak (2) from the fitting."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The Oberleutnant fitted the harness himself, tightening straps with clinical disinterest. [color=white]\"It will bruise. It will also stop your man freezing solid,\"[/color] he said. \"Liberation is complicated logistics,\" was his entire explanation for being here.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const character = this.getEventCharacter(1);
        this.actionManager().applyBuffToCharacter(character, new Weak(2));
        this.selectedRelic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        this.addLedgerItem(this.selectedRelic);
        this.actionManager().displaySubtitle(`Received ${this.selectedRelic.getDisplayName()}`, 2000);
    }
}

class DeclinePolitelyChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Decline. Stay neutral.",
            "The Company does not take sides in Deep France."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "He saluted with mechanical precision and returned to his zeppelin crew, unbothered. [color=white]\"Contractors,\"[/color] he noted to an aide, in the tone of a man filing a minor complaint.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {}
}

export class ReichsinfernokorpsCryoTruceEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Oberleutnant's Offer";
        this.portraitName = "placeholder_event_background_1";
        this.description = "DISPATCH — Deep France, no-man's-land.\n" +
            "A Reichsinfernokorps cryo-trooper flags us down between the lines, zeppelin shadow overhead. He offers surplus cold-weather kit, [color=white]\"purely humanitarian,\"[/color] in exchange for nothing he'll name outright. Morrison notes the crates are stencilled for someone else's unit. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new AcceptCryoGearChoice(),
            new DeclinePolitelyChoice()
        ];
    }
}
