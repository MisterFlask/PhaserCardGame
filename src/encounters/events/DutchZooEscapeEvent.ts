/**
 * 
 * We'd just crested the ridge when I saw it - the most preposterous sight yet in this infernal tour. Some fool Dutchman had established a roadside zoo. In Hell. Iron cages lined up neat as you please, each containing something that would give Darwin nightmares. A painted banner proclaimed "De Gezellige Helmenagerie" - which Morrison translated as "The Cozy Hell-Zoo." Underneath, a smaller sign boasted "Entirely Safe" in English.
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
            "Order your men to recapture the beast",
            "The artifact might be valuable."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The artifact was calling to me - I could feel its pull even through the tent canvas. Besides, how hard could it be to corral one escaped animal? We'd faced worse in Afghanistan. Or so I told myself.\n\n" +
            "\"Right then,\" I said, drawing my pistol with what I hoped looked like confidence. \"Morrison, Thompson, Jenkins - with me. The rest of you, guard the boats.\"\n\n" +
            "The Dutchman practically danced with joy, wooden shoes clattering. [color=white]\"Oh, vonderful! Truly most superior! Just follow ze roaring—you cannot miss it. Ve vill ready ze containment cage.\"[/color]\n\n" +
            "He scurried off, leaving us to approach the source of destruction. The smell hit first - sulfur mixed with machine oil and something organic that had been burning too long. Through the haze, we saw it.\n\n" +
            "The \"daemon\" was an abomination of flesh and machinery, like something cobbled together by a demented engineer with access to a slaughterhouse. Gears ground where joints should be, steam vented from wounds that looked deliberate, and its eyes... Christ, its eyes were furnace doors, glowing with hellfire.\n\n" +
            "It saw us and charged.\n\n" +
            "The battle was a nightmare of dodging mechanical claws and trying to find soft spots in its armor-plated hide. Morrison took a swipe that sent him flying into a cage of something that laughed at his misfortune. Thompson's rifle shots just made it angrier.\n\n" +
            "We finally brought it down through sheer luck - Jenkins managed to jam his bayonet into what turned out to be a critical gear assembly. The thing ground to a halt, wheezing steam and curses in languages that predated Babel.\n\n" +
            "The Dutchman appeared as if by magic, directing his assistants to drag the beast back to a reinforced cage. [color=white]\"Magnificent! Such technique! You are natural daemon-wranglers, ja?\"[/color]\n\n" +
            "The artifact he handed over was warm and pulsing, definitely worth a few bruises. Morrison needed stitches, and Thompson's nerves were shot, but we'd survived. As we left, I noticed the Dutchman updating his sign. \"52 dagen sinds laatste veiligheidsincident,\" it now read.\n\n" +
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
            "Make your excuses",
            "This is clearly not your problem."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "I looked at the demolished refreshment stand, the hysterical caged beasts, and the hopeful Dutchman in his ridiculous wooden shoes. The arithmetic was simple: potential death versus potential reward. The reward would have to be the Crown Jewels to make this worthwhile.\n\n" +
            "\"Terribly sorry,\" I said, already backing away. \"Prior engagement. Urgent Company business. You understand.\"\n\n" +
            "The clogger's face fell like a failed soufflé. [color=white]\"Ah, I see. Ja, it is perhaps a bit... inconvenient.\"[/color]\n\n" +
            "Another roar echoed across the ridge, followed by the distinctive sound of something large discovering the gift shop. The Dutchman winced. [color=white]\"Ve vill manage, somehow. Ze creature cannot digest vood, only flesh, so ze structural damage is mainly cosmetic.\"[/color]\n\n" +
            "As we hurried past, I caught a glimpse of his other exhibits. The signs were neatly lettered in Dutch: \"Gehenna Hamster - Do Not Feed After Midnight,\" \"Lesser Spine Devil - Likes Belly Rubs,\" \"Torment Turtle - 200 Years Old!\"\n\n" +
            "The man was clearly mad. Even in Hell, there are limits to entrepreneurial ambition. A zoo? What next, a tearoom?\n\n" +
            "We left them to their fate. Last I saw, the Dutchman was trying to lure his escaped specimen back with what appeared to be a leg of mutton on a very long pole. The other cloggers watched from safe distances, taking notes.";
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
        this.description = "We'd just crested the ridge when I saw it - the most preposterous sight yet in this infernal tour. Some fool Dutchman had established a roadside zoo. In Hell. Iron cages lined up neat as you please, each containing something that would give Darwin nightmares. A painted banner proclaimed \"De Gezellige Helmenagerie\" - which Morrison translated as \"The Cozy Hell-Zoo.\" Underneath, a smaller sign boasted \"Entirely Safe\" in English.\n\n" +
            "Thompson muttered \"Fucking cloggers\" just as a small figure came careening toward us, wooden shoes skittering on the volcanic gravel like a newborn colt on ice.\n\n" +
            "[color=white]\"Ach, thank goodness—visitors! Most fortuitous timing!\"[/color] The creature - for I hesitate to call him a man - was mostly singed lab coat and spectacles held together with wire. His accent was thick enough to spread on bread. [color=white]\"Ve hef a minor inconvenience, ja? A tiny... escape problem. Vun daemon has broken containment und is rampaging about, entirely indifferent to ze careful work ve hef done here.\"[/color]\n\n" +
            "As if to punctuate his statement, something roared from behind the exhibition. It was the sound a locomotive might make if locomotives could feel murderous rage.\n\n" +
            "The Dutchman adjusted his spectacles nervously. [color=white]\"Ja, ze other beasts remain safely caged. Ve built ze bars very strong. But zis vun is, vell—ze bars vere not quite strong enough.\"[/color] He had the grace to look embarrassed. [color=white]\"Perhaps you vould assist us in returning it to containment? Ve vould be most appreciative.\"[/color]\n\n" +
            "He gestured toward a tent that glowed with the telltale light of infernal contraband. [color=white]\"Und of course, ve vould reward you vith a remarkable ekshperimental artefact—fascinating und completely safe.\"[/color]\n\n" +
            "Another bellow shook the ground. Through the smoke, I glimpsed something large demolishing what appeared to be the zoo's refreshment stand. The other caged creatures were going wild, rattling their bars and howling in what sounded suspiciously like encouragement.\n\n" +
            "The Dutchman stood there, hopeful as a spaniel, apparently convinced that foreign soldiers would naturally leap at the chance to wrangle his escaped nightmare. Typical clogger logic.";
        
        this.choices = [
            new CatchDaemonChoice(),
            new DeclineChoice()
        ];
    }
}