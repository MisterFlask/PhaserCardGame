/**
 * 
 * The stench hit us first - not the usual brimstone and decay, but something worse: carbolic acid and Dutch tobacco. Through the ash-laden air, I spotted what no man should see in Hell: a field hospital, complete with pristine canvas tents arranged in military precision.
 * Jenkins muttered "Bloody cloggers" just as they noticed us. A dozen figures in spotless white coats came shuffling forward, their wooden shoes somehow immaculate despite the volcanic dust. The sound of their approach - clack-clack-clack - still haunts me.
 */

import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { AbstractRelic } from "../../relics/AbstractRelic";
import { RelicsLibrary } from "../../relics/RelicsLibrary";
import { ActionManager } from "../../utils/ActionManager";
import { getRandomHellDisease } from "./event_buffs/HellDiseases";

class AcceptDiseaseChoice extends AbstractChoice {
    private selectedRelic: AbstractRelic | null = null;

    constructor() {
        super(
            "Order one of your men to volunteer",
            "For science, as they say."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The artifact was too tempting to refuse. I've seen what infernal relics can do - turn battles, save lives, make fortunes. If the price was one man's temporary discomfort, well, that's why I keep spares.\n\n" +
            "I selected Private Hutchinson - he'd been complaining about the heat anyway, and a fever might shut him up. The cloggers practically danced with joy. [color=white]\"Ja, excellent choice! Zeer goed!\"[/color]\n\n" +
            "The procedure was revolting. They produced needles like nothing from earthly medicine - twisted things that seemed to writhe in their hands. The lead researcher muttered in Dutch while his assistants took notes with the dedication of acolytes. Hutchinson went pale as they injected something that moved under his skin like a living thing.\n\n" +
            "Within minutes, he was sweating through his uniform, eyes glassy with fever. The Dutchmen nodded approvingly, scribbling observations. [color=white]\"Perfectly normal reaction,\"[/color] they assured me. [color=white]\"Only occasionally fatal.\"[/color]\n\n" +
            "The artifact they handed over was warm to the touch, pulsing with energies that made my teeth ache. Worth it, I told myself, watching Hutchinson sway on his feet. The lad would recover. Probably. And if not, the Company would send replacements.\n\n" +
            "The cloggers packed up with frightening efficiency, already discussing their next experiments. As they clacked away into the ash, I heard one say something about \"Phase Two\" and \"larger sample sizes.\" I didn't ask for clarification.\n\n" +
            "Hutchinson's developed quite the cough since then. And the boils. But the artifact's proven useful enough that I'm calling it a fair trade. That's leadership - knowing when to spend your men's health for the greater good. My greater good, specifically.";
    } 

    init(): void {
        // Select a relic when the choice is initialized
        this.selectedRelic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        this.mechanicalInformationText = "For science, as they say."
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const gameState = this.gameState();
        const character = this.getRandomCharacter(); 
        const actionManager = ActionManager.getInstance();
        
        // Apply random disease debuff
        const diseaseBuff = getRandomHellDisease(1);
        actionManager.applyBuffToCharacter(character, diseaseBuff);
        
        // Add the selected relic to inventory
        if (this.selectedRelic) {
            this.actionManager().addRelicToInventory(this.selectedRelic);
            actionManager.displaySubtitle(`Received ${this.selectedRelic.getDisplayName()}`, 2000);
        }
        
        // Display what disease was contracted
        actionManager.displaySubtitle(`Contracted ${diseaseBuff.getDisplayName()}`, 2000);
    }
}

class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "Refuse politely",
            "Your father always told you never to trust a man in clogs."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Father was right about many things - the importance of a good tailor, the value of strategic cowardice, and absolutely never trusting Dutchmen in wooden shoes. Especially Dutch medical researchers. In Hell.\n\n" +
            "I manufactured a smile and declined with all the false regret I could muster. Something about Company regulations and the men's insurance policies. The lead clogger's face went through several expressions before settling back on his initial cheer - like watching a clockwork reset itself.\n\n" +
            "[color=white]\"Ah, a shame,\"[/color] he said, making a note in his ledger with disturbing finality. [color=white]\"Science marches on, however! Ve will find other... volunteers.\"[/color]\n\n" +
            "The efficiency with which they packed up their hellish clinic was more frightening than any demon we'd faced. Within minutes, the entire operation was collapsed, catalogued, and loaded onto carts pulled by things I didn't look at too closely. The cloggers formed up in a neat line and marched off, their wooden shoes keeping perfect time against the volcanic stone.\n\n" +
            "Morrison actually saluted me after they left. \"Thank you, sir,\" he said quietly. \"My cousin died in a Dutch field hospital in Java. Said they were doing 'research' on tropical diseases.\"\n\n" +
            "I watched the white coats disappear into the ash-haze, that sickly glow from their artifacts fading with them. Whatever they were truly doing out here, it wasn't medicine as any Christian would recognize it. Some bargains, even in Hell, are too dear at any price.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {}
}

export class DiseaseForMoneyEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Cloggers Want A Body";
        this.portraitName = "placeholder_event_background_1";
        this.description = "The stench hit us first - not the usual brimstone and decay, but something worse: carbolic acid and Dutch tobacco. Through the ash-laden air, I spotted what no man should see in Hell: a field hospital, complete with pristine canvas tents arranged in military precision.\n\n" +
            "Jenkins muttered \"Bloody cloggers\" just as they noticed us. A dozen figures in spotless white coats came shuffling forward, their wooden shoes somehow immaculate despite the volcanic dust. The sound of their approach - clack-clack-clack - still haunts me.\n\n" +
            "[color=white]\"Ah, goedendag!\"[/color] Their leader's accent was thick as treacle, his brass spectacles reflecting the hellfire. [color=white]\"You hef arrifed at a most oppurtune moment, mijn vrienden! Ja, history in de making—met uw hulp, natuurlijk.\"[/color]\n\n" +
            "I'd dealt with Dutchmen before - usually involving opium or diamonds - but never in Hell. This one had the eager look of a natural philosopher who'd dissected one too many corpses. His assistants clustered behind him like medical students around a particularly interesting tumor.\n\n" +
            "[color=white]\"Ve are conductink a small, very controlled ekshperiment,\"[/color] he continued, gesturing at his infernal clinic. [color=white]\"Ve vould like vun of your men to hef just a klein infection—nothing to vorry about. A touch of ze ashen flux. Highly educational, yes?\"[/color]\n\n" +
            "Before I could respond, his assistant produced a velvet-lined box. Whatever lay inside glowed with the sick light of concentrated damnation. Even from ten paces, I could feel it pulling at something behind my eyes.\n\n" +
            "[color=white]\"Und naturlich, ve vill offer you vun of our... unique ekshperimental artefacts. A very rare specimen, ja? Fascinating properties!\"[/color]\n\n" +
            "The lead clogger beamed at me with the confidence of a man who'd never been shot at. [color=white]\"Ze prognosis is very goed. Almost entirely survivable. Ve hef many... promising remedies.\"[/color]\n\n" +
            "He rocked on those absurd wooden shoes, waiting. My men looked to me, and I saw Morrison's hand drift toward his rifle. The Dutchman's \"remedies\" were likely lined up in jars somewhere, pickled and labeled in Latin.";
        
        this.choices = [
            new AcceptDiseaseChoice(),
            new DeclineChoice()
        ];
    }
}

