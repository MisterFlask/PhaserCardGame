/**
 * 
 * atop a ridge of smouldering brimstone, a crude roadside attraction sprawls across the scorched earth. rattling iron cages house snarling, pacing beasts of infernal biology, carefully labeled in tidy dutch handwriting. above them waves a hopeful banner: [color=teal] "De Gezellige Helmenagerie".[/color]  Underneath, a smaller banner in English: [color=teal]"Entirely Safe"[/color].

you stop, cautiously eyeing the scene. a small man in a singed lab coat lurches frantically toward you, wooden shoes tripping over the volcanic gravel.  One of your soldiers mutters: "f___ing cloggers."

"ach, thank goodness—visitors! most fortuitous timing!" he pants, pushing soot-smeared spectacles up his nose. "ve hef a minor inconvenience, ja? a tiny... escape problem. vun daemon has broken containment und is rampaging about, entirely indifferent to ze careful work ve hef done here."

behind him, a guttural roar echoes, deeply unconcerned with the optimistic signage.

"ja, ze other beasts remain safely caged. ve built ze bars very strong. but zis vun is, vell—ze bars vere not quite strong enough." he sighs, embarrassed. "perhaps you vould assist us in returning it to containment? ve vould be most appreciative."

he nods earnestly toward a tent containing vague, glowing objects of presumably infernal origin. "und of course, ve vould reward you vith a remarkable ekshperimental artefact—fascinating und completely safe."

the daemon bellows again, sounding neither friendly nor particularly safe.
 */

import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Lethality } from "../../gamecharacters/buffs/standard/Lethality";
import { Terrifying } from "../../gamecharacters/buffs/standard/Terrifying";
import { AbstractRelic } from "../../relics/AbstractRelic";
import { RelicsLibrary } from "../../relics/RelicsLibrary";
import { ClockworkAbomination, Encounter } from "../EncounterManager";

class CatchDaemonChoice extends AbstractChoice {
    private selectedRelic: AbstractRelic | null = null;

    constructor() {
        super(
            "Help Capture the Daemon",
            "Combat will ensue."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The clogger beams with relief. \"Oh, vonderful! Truly most superior! Just follow ze roaring—you cannot miss it. Ve vill ready ze containment cage.\" He scurries off, wooden shoes clacking frantically against volcanic gravel.\n\nAs you approach the source of the bellowing, the air grows sulfurous and thick. Through the haze, you spot a hulking, terrible form—more machinery than flesh, its parts grinding and steaming as it tears through what remains of the menagerie's snack bar.";
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
        
        // Create a custom encounter with the daemon
        const encounter = new Encounter([escapedDaemon], this.gameState().currentAct, 0);
        encounter.backgroundNameOverride = "hell-oil-painting";
        
        // First store the relic to add after combat
        const relicToAdd = this.selectedRelic;
        
        // Start combat with the daemon
        this.actionManager().cleanupAndRestartCombat({ 
            encounter: encounter, 
            shouldStartWithMapOverlay: false
        });
        
        // Add the relic right away since we can't use onVictory callback
        if (relicToAdd) {
            this.addLedgerItem(relicToAdd);
            this.actionManager().displaySubtitle(`Received ${relicToAdd.getDisplayName()}`, 2000);
        }
    }
}


class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "Decline to Help",
            "This is clearly not your problem."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The clogger's face falls. \"Ah, I see. Ja, it is perhaps a bit... inconvenient.\" Another roar echoes, followed by the sound of splintering wood. The clogger winces. \"Ve vill manage, somehow. Ze creature cannot digest vood, only flesh, so ze structural damage is mainly cosmetic.\" He sighs, looking forlornly at his exhibition. \"Perhaps zis is not ze ideal location for a roadside attraction after all.\"";
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
        this.description = "Atop a ridge of smouldering brimstone, a crude roadside attraction sprawls across the scorched earth. Rattling iron cages house snarling, pacing beasts of infernal biology, carefully labeled in tidy Dutch handwriting. Above them waves a hopeful banner: [color=teal]\"De Gezellige Helmenagerie.\"[/color] Underneath, a smaller banner: [color=teal]\"51 dagen sinds laatste veiligheidsincident\"[/color].\n\n" +
            "You stop, cautiously eyeing the scene. A small man in a singed lab coat lurches frantically toward you, wooden shoes tripping over the volcanic gravel. One of your soldiers mutters: \"F___ing cloggers.\"\n\n" +
            "[color=white]\"Ach, thank goodness—visitors! Most fortuitous timing!\"[/color] he pants, pushing soot-smeared spectacles up his nose. [color=white]\"Ve hef a minor inconvenience, ja? A tiny... escape problem. Vun daemon has broken containment und is rampaging about, entirely indifferent to ze careful work ve hef done here.\"[/color]\n\n" +
            "Behind him, a guttural roar echoes, deeply unconcerned with the optimistic signage.\n\n" +
            "[color=white]\"Ja, ze other beasts remain safely caged. Ve built ze bars very strong. But zis vun is, vell—ze bars vere not quite strong enough.\"[/color] He sighs, embarrassed. [color=white]\"Perhaps you vould assist us in returning it to containment? Ve vould be most appreciative.\"[/color]\n\n" +
            "He nods earnestly toward a tent containing vague, glowing objects of presumably infernal origin. [color=white]\"Und of course, ve vould reward you vith a remarkable ekshperimental artefact—fascinating und completely safe.\"[/color]\n\n" +
            "The daemon bellows again, sounding neither friendly nor particularly safe.";
        
        this.choices = [
            new CatchDaemonChoice(),
            new DeclineChoice()
        ];
    }
}