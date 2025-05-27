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
        this.nextEvent.description = "I ordered Morrison forward. The lad's a good soldier - followed orders even as his hands shook. Someone had to test this opportunity, and better him than me. That's what subordinates are for, after all.\n\n" +
            "The angel - for what else could it be? - gestured to a chair that hadn't been there moments before. Morrison sat rigid as a corpse while the thing began its work.\n\n" +
            "The process was... indescribable. Its needles moved with mechanical precision, yet the patterns they traced seemed to shift and grow even as I watched. Mathematical curves that suggested infinity while remaining perfectly bounded. Geometric forms that made sense from one angle and none from another. Morrison's knuckles went white gripping the chair arms, but to his credit, he didn't scream.\n\n" +
            "When it finished, the design glowed like sunset through stained glass before settling into his skin. Now, hours later, Morrison keeps rubbing at it, swearing the lines grow deeper when he's not looking directly at them. He's jumpy as a cat, starting at shadows, but I've noticed something else - his reflexes have sharpened considerably. Nearly took Jenkins' head off when the poor sod tapped his shoulder at dinner.\n\n" +
            "The ferryman won't look at Morrison now, just crosses himself and mutters about \"heaven's brand.\" But if celestial tattoos can give my men an edge in this hellhole, I'll take it. Morrison's discomfort is a small price for advantage.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const gameState = this.gameState();
        const character = this.getRandomCharacter(); // Assumes first character is the soldier
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
        this.nextEvent.description = "When presented with an opportunity, I've always believed in seizing it fully. I ordered Morrison to request the angel's \"complete work.\" The lad actually tried to protest - first time in three years of service. I reminded him sharply of his duty.\n\n" +
            "The angel's eyes - all of them - brightened at my decision. The payment it extracted from Morrison... I understand now why there's no human word for it. The boy aged five years in as many seconds. Something fundamental was torn from him, though I couldn't say what.\n\n" +
            "The process itself defied comprehension. Time stuttered and flowed backward. The angel's arms occupied multiple positions simultaneously, needles tracing patterns not just on Morrison's skin but through it, beyond it, into spaces that don't properly exist. He did scream then - horrible, animal sounds that I'll hear in my nightmares.\n\n" +
            "Jenkins tried to pull him out, but I held the fool back. The angel's wings blocked any escape without seeming to move. When it finally finished, Morrison collapsed like a marionette with cut strings.\n\n" +
            "The design it carved extends past what eyes can see, past what mirrors can reflect. It shimmers constantly, pulsing to a rhythm that has nothing to do with Morrison's heartbeat. He's been catatonic for hours, occasionally muttering in languages none of us recognize. But when he does focus, there's power in his movements that frightens even me.\n\n" +
            "I tell myself it was necessary, that we need every advantage in this place. But watching Morrison stare at nothing with those hollow eyes, I wonder if I've created something worse than what we're fighting.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const gameState = this.gameState();
        const character = this.getRandomCharacter();
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
        this.nextEvent.description = "For once, my instinct for self-preservation extended to my men. That untranslatable sound - the ferryman's expression when he heard it - told me all I needed to know. Whatever coin this creature traded in, it wasn't one I could afford to spend. Not even Morrison's.\n\n" +
            "I manufactured some excuse about regulations and prior commitments. The angel's needles stopped their dance. Its wings folded in ways that hurt to perceive. Without a word - if it ever truly spoke at all - the entire establishment began to collapse. Not like a building falling, but like a mathematical proof being disproven. Walls folded through themselves, the ceiling became the floor without moving, and the whole impossible structure simply ceased.\n\n" +
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
        this.description = "I've seen my share of impossibilities - Afghan fakirs, Borneo witch-doctors, that business in the Crimea - but nothing prepared me for this afternoon's encounter. We'd stopped to repair the boat's hull when Private Morrison spotted what appeared to be a respectable establishment through the marsh mist. Clean marble columns, silver appointments, spotlessly white awning. In this godforsaken swamp!\n\n" +
            "Against my better judgment (and the ferryman's frantic protests), I ordered an investigation. The moment we crossed the threshold, I knew I'd made a terrible mistake. The thing inside... Christ, how do I even describe it?\n\n" +
            "Wings. Eyes. Flame. All occupying the same space without seeming to crowd each other. A dozen arms - or were they wings? - each holding needles that gleamed like starlight. It rotated slowly in the air, and watching it made my teeth ache.\n\n" +
            "[color=yellow]\"COME,\"[/color] it said, though its voice seemed to bypass our ears entirely and echo directly in our skulls. Beautiful and terrible, like a cathedral bell made of screaming. [color=yellow]\"I OFFER MY ARTISTRY UNTO YOU.\"[/color]\n\n" +
            "Poor Morrison went white as paper. I was already calculating our retreat when it continued: [color=yellow]\"FOR A SMALL TATTOO, THERE SHALL BE NO CHARGE. FOR A GREATER TATTOO—A MARK OF TRUE SIGNIFICANCE—THERE IS ALSO NO CHARGE. THE ONLY COST IS—\"[/color]\n\n" +
            "Here it made a sound I cannot reproduce in writing. My hand trembles even trying. The ferryman later told me there's no word for it in any human tongue, though he seemed to understand its meaning well enough. Something about essence, or soul-weight, or the part of a man that dreams.\n\n" +
            "[color=yellow]\"MORE SO FOR THE LARGER TATTOO, OF COURSE.\"[/color]\n\n" +
            "The needles danced in its impossible hands. [color=yellow]\"CHOOSE.\"[/color]\n\n" +
            "Morrison looked at me with the expression of a man hoping his commanding officer will show sense for once.";
        
        this.choices = [
            new BasicTattooChoice(),
            new ElaborateTattooChoice(),
            new DeclineChoice()
        ];
    }
} 