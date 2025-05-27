import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { ActionManager } from "../../utils/ActionManager";
import { getRandomAngelicTattooBuff } from "./event_buffs/AngelicTattooBuffs";

class BasicTattooChoice extends AbstractChoice {
    constructor() {
        super(
            "Accept the Basic Tattoo",
            "Your soldier gains an angelic tattoo buff permanently and 2 Stress."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The angel begins. Its needles move with measured precision, tracing forms that suggest the infinite while coiling in finite space. Fractal curves weave into geometric sequences, shifting in ways that cannot be fully apprehended. When the work is complete, the tattoo glows faintly before settling into the skin, its lines seeming to grow deeper and more intricate when not directly observed.";
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
            "Request the 'Complete Work'",
            "Your soldier gains a more powerful angelic tattoo buff permanently and 5 Stress."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Payment is rendered, and time begins to warp. The angel's tools blur into movement too rapid and complex to follow, its arms appearing to occupy multiple positions simultaneously. Patterns form not only on the skin but beyond it, extending into dimensions that do not intersect with known reality. The design remains active, faintly shimmering in a rhythm unbound by ordinary perception.";
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
            "Politely Decline",
            "You don't like the sound of that [color=yellow][UNTRANSLATABLE GLYPH][/color]."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The angel's limbs pause, and its tools vanish into the silence. The parlor collapses in on itself, folding along axes that do not seem to exist, leaving only bare slag behind. Nothing remains to suggest it had ever been there at all.";
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
        this.description = "In the middle of nowhere, an impossible tattoo parlor awaits. It's elegant, terrifyingly clean, all polished marble and silver filigree. Within hovers a figure composed entirely of wings, flame, and eyeballs. They rotate slowly in impossible geometries, ink-stained needles flickering in its dozen feathered hands.\n\n" +
            "[color=yellow]\"COME,\"[/color] the angel commands. The voice is beautiful. The voice is horrifying. It echoes behind your eyes. [color=yellow]\"I OFFER MY ARTISTRY UNTO YOU.\"[/color]\n\n" +
            "[color=yellow]\"FOR A SMALL TATTOO, THERE SHALL BE NO CHARGE. FOR A GREATER TATTOO—A MARK OF TRUE SIGNIFICANCE—THERE IS ALSO NO CHARGE. THE ONLY COST IS [UNTRANSLATABLE GLYPH].  MORE SO FOR THE LARGER TATTOO, OF COURSE.\"[/color]\n\n" +
            "The angel pauses, needles poised.\n\n" +
            "[color=yellow]\"CHOOSE.\"[/color]";
        
        this.choices = [
            new BasicTattooChoice(),
            new ElaborateTattooChoice(),
            new DeclineChoice()
        ];
    }
} 