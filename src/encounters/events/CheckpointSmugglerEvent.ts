import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { SirenDaguerreotype } from "../../relics/cursedcargo/cards/SirenDaguerreotype";
import { WatchfulClown } from "../../relics/cursedcargo/cards/WatchfulClown";

class AcceptSafeContrabandChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Take the satchel.",
            "Gain the Siren Daguerreotype. Seems harmless enough."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Stowed it in the crawler's hidden compartment. Checkpoint inspection was tense — an inspector lingered near the panel — but we passed through. Inside: a photograph, the 'Siren Daguerreotype.' Unsettling, but light. Morrison keeps giving me looks.\n" +
            "— Cavendish";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const card = new SirenDaguerreotype();
        this.actionManager().addCardToMasterDeck(card);
        this.actionManager().displaySubtitle(`Received ${card.name}`, 2000);
    }
}

class AcceptDangerousContrabandChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Take the box. No questions.",
            "Gain the Watchful Clown. Fortune favors the bold, allegedly."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "\"Theological ordnance,\" he called it. The box grew heavier as we neared the checkpoint, and it whispered. We scraped through when a fight elsewhere drew the inspectors off. Thompson swears it sings hymns. It's called the 'Watchful Clown.'\n" +
            "— Cavendish";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const card = new WatchfulClown();
        this.actionManager().addCardToMasterDeck(card);
        this.actionManager().displaySubtitle(`Received ${card.name}`, 2000);
    }
}

class TurnInSmugglerChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Seize him. Claim the bounty.",
            "Agree to his terms, then seize him for the bounty (gain £50)."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Morrison and Jenkins grabbed him; his knife caught Thompson's shoulder before they bore him down. Fired the signal shot — Ferrymen arrived suspiciously fast, paid the bounty in writs. \"This isn't over,\" he snarled. It rarely is.\n" +
            "— Cavendish";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const reward = 50;
        this.actionManager().modifyMoney(reward);
        this.actionManager().displaySubtitle(`Received £${reward}`, 2000);
    }
}

class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Decline. Reverse course.",
            "Refuse politely and leave. No good comes from smuggling in Hell."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Cited Company policy, backed the crawler away with Morrison's rifle trained on him. \"Coward!\" Pemberton shouted. \"De Vries pays in coins you can't imagine!\" No doubt.\n" +
            "— Cavendish";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {}
}

export class CheckpointSmugglerEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Checkpoint Smuggler";
        this.portraitName = "placeholder_event_background_1";
        this.description = "DISPATCH — Marsh checkpoint.\n" +
            "A ragged Englishman, one Pemberton, late of the 33rd Foot, blocks the road. Wants a satchel smuggled past the Ferrymen to his Dutch contact — a trifle called the Siren Daguerreotype, or, if I'm feeling bold, something called the Watchful Clown. Alternatively I could just seize him for the bounty. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new AcceptSafeContrabandChoice(),
            new AcceptDangerousContrabandChoice(),
            new TurnInSmugglerChoice(),
            new DeclineChoice()
        ];
    }
}

