import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { ActionManager } from "../../utils/ActionManager";
import { getRandomAngelicTattooBuff } from "./event_buffs/AngelicTattooBuffs";

class BasicTattooChoice extends AbstractChoice {
    constructor() {
        super(
            "Order Morrison to take the small tattoo",
            "What's a bit of stress for a soldier?"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "I ordered Morrison forward. Better him than me - that's what subordinates are for, after all.\n\n" +
            "The angel gestured to a chair that hadn't been there moments before. Its needles traced patterns that hurt to look at - mathematical curves suggesting infinity, geometric forms that made sense from one angle and none from another. Morrison gripped the chair white-knuckled but didn't scream.\n\n" +
            "When finished, the design glowed like stained glass before settling into his skin. Hours later, Morrison's jumpy as a cat, swearing the lines shift when he's not looking. His reflexes have sharpened considerably though - nearly took Jenkins' head off at dinner.\n\n" +
            "The ferryman won't look at him now, just crosses himself and mutters about \"heaven's brand.\" But if celestial tattoos give my men an edge in this hellhole, Morrison's discomfort is a small price.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const gameState = this.gameState();
        const character = this.getEventCharacter(1); // predetermined soldier
        const actionManager = ActionManager.getInstance();
        
        // Apply angelic tattoo buff and stress
        const tattooBuff = getRandomAngelicTattooBuff(1);
        actionManager.applyBuffToCharacter(character, tattooBuff);
        actionManager.applyBuffToCharacter(character, new Stress(2));
        
        // Display what buff was applied
        actionManager.displaySubtitle(`Received the ${tattooBuff.getDisplayName()}`, 2000);
    }
}

class ElaborateTattooChoice extends AbstractChoice {
    constructor() {
        super(
            "Order Morrison to get the full treatment",
            "No point in half measures."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "I've always believed in seizing opportunities fully. Morrison actually tried to protest - first time in three years. I reminded him sharply of his duty.\n\n" +
            "The angel's eyes - all of them - brightened. The payment it extracted... the boy aged five years in as many seconds. Something fundamental was torn from him.\n\n" +
            "Time stuttered during the process. The angel's arms occupied multiple positions simultaneously, needles tracing patterns not just on Morrison's skin but through it, into spaces that don't properly exist. He screamed then - horrible sounds I'll hear in my nightmares.\n\n" +
            "The finished design extends past what eyes can see. It pulses to a rhythm that has nothing to do with Morrison's heartbeat. He's been catatonic for hours, muttering in unknown languages. But when he does focus, there's power in his movements that frightens even me.\n\n" +
            "I tell myself it was necessary. But watching Morrison stare at nothing with those hollow eyes, I wonder if I've created something worse than what we're fighting.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const gameState = this.gameState();
        const character = this.getEventCharacter(1);
        const actionManager = ActionManager.getInstance();
        
        // Apply more powerful angelic tattoo buff and stress
        const tattooBuff = getRandomAngelicTattooBuff(2);
        actionManager.applyBuffToCharacter(character, tattooBuff);
        actionManager.applyBuffToCharacter(character, new Stress(5));
        
        // Display what buff was applied
        actionManager.displaySubtitle(`Received the ${tattooBuff.getDisplayName()} (Enhanced)`, 2000);
    }
}

class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "Make your excuses",
            "You don't like the sound of that soul-weight business."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "For once, my instinct for self-preservation extended to my men. That untranslatable sound - the ferryman's expression - told me all I needed. Whatever coin this creature traded in, I couldn't afford it.\n\n" +
            "I manufactured excuses about regulations. The angel's needles stopped. Without a word, the entire establishment began to collapse - not like a building falling, but like a mathematical proof being disproven. Walls folded through themselves, the whole structure simply ceased.\n\n" +
            "Where it stood, only scorched marsh grass remains.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {}
}

export class AngelicTattooEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Seraphic Tattooist";
        this.portraitName = "placeholder_event_background_2";
        this.description = "I've seen impossibilities - Afghan fakirs, Borneo witch-doctors - but nothing prepared me for this. Morrison spotted what appeared to be a respectable establishment through the marsh mist. Clean marble, silver appointments. In this godforsaken swamp!\n\n" +
            "Against better judgment (and the ferryman's protests), I ordered an investigation. The moment we crossed the threshold, I knew I'd erred.\n\n" +
            "The thing inside... Wings. Eyes. Flame. All occupying the same space. A dozen arms holding needles like starlight. It rotated slowly, making my teeth ache.\n\n" +
            "[color=yellow]\"COME,\"[/color] it said, its voice bypassing our ears entirely. Beautiful and terrible, like a cathedral bell made of screaming. [color=yellow]\"I OFFER MY ARTISTRY. FOR A SMALL TATTOO, NO CHARGE. FOR A GREATER MARK—ALSO NO CHARGE. THE ONLY COST IS—\"[/color]\n\n" +
            "Here it made a sound I cannot reproduce. The ferryman understood - something about soul-weight, or the part of a man that dreams.\n\n" +
            "[color=yellow]\"MORE SO FOR THE LARGER TATTOO, OF COURSE. CHOOSE.\"[/color]\n\n" +
            "Morrison looked at me hoping for sense.";
        
        this.choices = [
            new BasicTattooChoice(),
            new ElaborateTattooChoice(),
            new DeclineChoice()
        ];
    }
}