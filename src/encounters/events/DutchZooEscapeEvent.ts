import { AbstractChoice, AbstractEvent, DeadEndEvent, DeadEndStartEncounterChoice } from "../../events/AbstractEvent";
import { Lethality } from "../../gamecharacters/buffs/standard/Lethality";
import { Terrifying } from "../../gamecharacters/buffs/standard/Terrifying";
import { AbstractRelic } from "../../relics/AbstractRelic";
import { RelicsLibrary } from "../../relics/RelicsLibrary";
import { ClockworkAbomination, Encounter } from "../EncounterManager";

class CatchDaemonChoice extends DeadEndStartEncounterChoice {
    private selectedRelic: AbstractRelic | null = null;

    constructor() {
        const dummyEncounter = new Encounter([], 0, 0);
        super(
            "WIRE: Recapture it. Send the men.",
            dummyEncounter,
            "The artifact might be valuable."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Ordered the men in, remaining well back myself. The beast was flesh and grinding machinery, furnace-eyed. Jenkins finished it with a bayonet to the gears. Dutchman handed over the artifact, delighted. \"Natural daemon-wranglers,\" he called them.\n" +
            "— Cavendish";
    }

    init(): void {
        // Select a relic when the choice is initialized
        this.selectedRelic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        this.mechanicalInformationText = "Combat will ensue.  Gain " + this.selectedRelic.getDisplayName() + " as a reward.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        // Create a special daemon enemy
        const escapedDaemon = new ClockworkAbomination();
        escapedDaemon.name = "Escaped Hellmenagerie Beast";
        escapedDaemon.portraitName = "Clockwork Abomination";
        escapedDaemon.maxHitpoints = 45;
        escapedDaemon.buffs.push(new Lethality(3));
        escapedDaemon.buffs.push(new Terrifying(2));

        // Configure the encounter for the base class
        this.encounter.enemies = [escapedDaemon];
        this.encounter.act = this.gameState().currentAct;
        this.encounter.segment = 0;
        this.encounter.backgroundNameOverride = "hell-oil-painting";

        const relicToAdd = this.selectedRelic;

        super.effect();

        if (relicToAdd) {
            this.addLedgerItem(relicToAdd);
            this.actionManager().displaySubtitle(`Received ${relicToAdd.getDisplayName()}`, 2000);
        }
    }
}

class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Not our problem. Withdraw.",
            "This is clearly not your problem."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Cited prior engagement, backed away smartly. [color=white]\"Ah, inconvenient,\"[/color] the Dutchman sighed. Last I saw, he was luring the beast back with mutton on a very long pole. Not our funeral.\n" +
            "— Cavendish";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        // No permanent effect
    }
}

export class DutchZooEscapeEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "Hellmenagerie Escape";
        this.portraitName = "placeholder_event_background_1";
        this.description = "DISPATCH — roadside, unnamed.\n" +
            "A Dutchman has built a roadside zoo, banner reading [color=white]\"Entirely Safe.\"[/color] Naturally, a daemon has broken containment and is demolishing the refreshment stand. He offers an artifact for its recapture, [color=white]\"fascinating und completely safe.\"[/color] Instructions?\n" +
            "— Cavendish";
        
        this.choices = [
            new CatchDaemonChoice(),
            new DeclineChoice()
        ];
    }
}