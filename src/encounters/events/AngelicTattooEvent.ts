import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { ActionManager } from "../../utils/ActionManager";
import { getRandomAngelicTattooBuff } from "./event_buffs/AngelicTattooBuffs";

class BasicTattooChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Authorize the small mark",
            "What's a bit of stress for a soldier?"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Morrison went forward, gripping the chair white-knuckled. The needles traced infinities that hurt to watch. Design settled like stained glass.\n\n" +
            "He's jumpy now, swears the lines move. Reflexes sharpened, though — nearly took Jenkins' head off at dinner. Small price.\n" +
            "— Cavendish";
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
            "WIRE: Authorize the full mark",
            "No point in half measures."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Overruled Morrison's protest. The angel's eyes brightened; he aged five years in as many seconds, screaming.\n\n" +
            "Catatonic now, muttering in tongues. When he focuses, there's a power that frightens even me. Necessary, I tell myself.\n" +
            "— Cavendish";
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
            "WIRE: Decline. Withdraw.",
            "You don't like the sound of that soul-weight business."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Cited regulations, backed toward the door. The needles stopped. The whole parlour folded through itself like a disproven theorem and simply ceased.\n\n" +
            "Only scorched marsh grass remains. Morrison looks vaguely disappointed.\n" +
            "— Cavendish";
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
        this.description = "DISPATCH — Styx Delta.\n" +
            "Found a tattoo parlour in the reeds. The proprietor is an angel — wings, eyes, flame, all occupying the same space; my teeth ache to look at it. It offers its artistry free of charge, which in my experience is the most expensive kind of free. It got as far as [color=yellow]\"THE ONLY COST IS—\"[/color] before I stepped smartly outside. Morrison, who has no instinct for self-preservation whatever, is rolling up his sleeve. Instructions?\n" +
            "— Cavendish";
        
        this.choices = [
            new BasicTattooChoice(),
            new ElaborateTattooChoice(),
            new DeclineChoice()
        ];
    }
}