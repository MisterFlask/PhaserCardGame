import { AbstractEvent, DeadEndEvent, DeadEndStartEncounterChoice } from "../../events/AbstractEvent";
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
            "Order your men to recapture the beast",
            dummyEncounter,
            "The artifact might be valuable."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The artifact was calling to me through the tent canvas. Besides, how hard could it be to corral one animal? We'd faced worse in Afghanistan. Or so I told myself.\n\n" +
            "\"Morrison, Thompson, Jenkins - with me,\" I ordered, feigning confidence.\n\n" +
            "The Dutchman danced with joy. [color=white]\"Vonderful! Follow ze roaring—you cannot miss it!\"[/color]\n\n" +
            "The smell hit first - sulfur, machine oil, and something organic burning too long. The \"daemon\" was an abomination of flesh and machinery. Gears ground where joints should be, steam vented from deliberate wounds, and its eyes were furnace doors glowing with hellfire.\n\n" +
            "It charged.\n\n" +
            "Morrison took a swipe that sent him flying. Thompson's rifle just made it angrier. We brought it down through sheer luck - Jenkins jammed his bayonet into a critical gear assembly. The thing ground to a halt, wheezing steam and pre-Babel curses.\n\n" +
            "The Dutchman appeared instantly. [color=white]\"Magnificent! Natural daemon-wranglers, ja?\"[/color]\n\n" +
            "The artifact he handed over was warm and pulsing, definitely worth Morrison's stitches and Thompson's shattered nerves. As we left, I noticed him updating his sign: \"52 dagen sinds laatste veiligheidsincident.\"\n\n" +
            "I suspect it won't last long.";
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
            "Make your excuses",
            "This is clearly not your problem."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "I looked at the demolished refreshment stand, the hysterical caged beasts, and the hopeful Dutchman. The arithmetic was simple: potential death versus potential reward. The reward would have to be the Crown Jewels.\n\n" +
            "\"Terribly sorry,\" I said, backing away. \"Prior engagement. Company business.\"\n\n" +
            "His face fell like a failed soufflé. [color=white]\"Ah, I see. It is perhaps... inconvenient.\"[/color]\n\n" +
            "Another roar echoed, followed by the sound of something discovering the gift shop. [color=white]\"Ze creature cannot digest vood, only flesh, so structural damage is mainly cosmetic.\"[/color]\n\n" +
            "As we hurried past, I glimpsed his other exhibits: \"Gehenna Hamster - Do Not Feed After Midnight,\" \"Lesser Spine Devil - Likes Belly Rubs.\"\n\n" +
            "The man was clearly mad. A zoo in Hell? What next, a tearoom?\n\n" +
            "Last I saw, he was trying to lure his specimen back with mutton on a very long pole. The other cloggers watched from safe distances, taking notes.";
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
        this.description = "We'd crested the ridge when I saw the most preposterous sight yet - some fool Dutchman had established a roadside zoo. In Hell. Iron cages neat as you please, each containing Darwin's nightmares. A banner proclaimed \"De Gezellige Helmenagerie\" - Morrison translated it as \"The Cozy Hell-Zoo.\" Underneath: \"Entirely Safe.\"\n\n" +
            "Thompson muttered \"Fucking cloggers\" as a singed lab coat came skittering toward us on wooden shoes.\n\n" +
            "[color=white]\"Ach, visitors! Most fortuitous!\"[/color] His accent was thick enough to spread on bread. [color=white]\"Ve hef minor inconvenience—vun daemon has broken containment. Ze bars vere not quite strong enough.\"[/color]\n\n" +
            "Something roared - the sound a locomotive might make if locomotives could feel murderous rage.\n\n" +
            "[color=white]\"Perhaps you assist? Ve vould reward you vith remarkable artefact—fascinating und completely safe.\"[/color]\n\n" +
            "Through the smoke, I glimpsed something large demolishing the refreshment stand. The caged creatures rattled their bars, howling encouragement.\n\n" +
            "The Dutchman stood hopeful as a spaniel, apparently convinced foreign soldiers would leap at the chance to wrangle his nightmare. Typical clogger logic.";
        
        this.choices = [
            new CatchDaemonChoice(),
            new DeclineChoice()
        ];
    }
}