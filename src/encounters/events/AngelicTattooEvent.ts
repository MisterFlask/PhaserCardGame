import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Lethality } from "../../gamecharacters/buffs/standard/Lethality";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { ActionManager } from "../../utils/ActionManager";

class BasicTattooChoice extends AbstractChoice {
    constructor() {
        super(
            "Accept the Basic Tattoo",
            "Your soldier gains some kind of buff permanently and 2 Stress."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The angel begins. Its needles move with measured precision, tracing forms that suggest the infinite while coiling in finite space. Fractal curves weave into geometric sequences, shifting in ways that cannot be fully apprehended. When the work is complete, the tattoo glows faintly before settling into the skin, its lines seeming to grow deeper and more intricate when not directly observed.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const gameState = this.gameState();
        const character = gameState.currentRunCharacters[0]; // Assumes first character is the soldier
        const actionManager = ActionManager.getInstance();
        
        // Apply buffs using ActionManager
        actionManager.applyBuffToCharacter(character, new Lethality(1));
        actionManager.applyBuffToCharacter(character, new Stress(1));
    }
}

class ElaborateTattooChoice extends AbstractChoice {
    constructor() {
        super(
            "Request the 'Complete Work' (Costs 75 Hell Currency)",
            "Your soldier gains some kind of buff permanently and 2 Stress."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Payment is rendered, and time begins to warp. The angel's tools blur into movement too rapid and complex to follow, its arms appearing to occupy multiple positions simultaneously. Patterns form not only on the skin but beyond it, extending into dimensions that do not intersect with known reality. The design remains active, faintly shimmering in a rhythm unbound by ordinary perception.";
    }

    canChoose(): boolean {
        return this.gameState().sovereignInfernalNotes >= 75;
    }

    effect(): void {
        const gameState = this.gameState();
        const character = gameState.currentRunCharacters[0];
        const actionManager = ActionManager.getInstance();
        
        actionManager.modifySovereignInfernalNotes(-75);
        actionManager.applyBuffToCharacter(character, new Lethality(2));
        actionManager.applyBuffToCharacter(character, new Stress(2));
    }
}

class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "Politely Decline",
            "Leave without a tattoo."
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
        this.name = "The Impossible Tattoo Parlor";
        this.portraitName = "placeholder_event_background_2";
        this.description = "In the slag marches, wedged between collapsing pylons of molten scrap and steel bones half-melted into abstract sculpture, stands a structure: a tattoo parlor whose walls bend at contradictory angles, as if a cathedral had been folded into a cramped shipping crate. The air inside is taut with a pressure that hums, but no sound reaches the ear. The floor appears motionless yet shifts in subtle ways that cannot be followed.\n\n" +
            "Inside, an [color=white]ANGEL[/color] operates a suspended array of instruments. Its form is a lattice of refracted light and twisted geometry, impossible to map fully in the mind. Multiple limbs, each wielding a needle-like stylus, carve the air in perfect arcs. The afterimages left by its movements coalesce briefly into intricate glyphs before dissolving, suggesting patterns larger than language.\n\n" +
            "Its voice is not heard but understood, as if the words bypass the senses entirely:\n" +
            "[color=white]\"YOUR FLESH. A CANVAS. SHALL WE INSCRIBE HIGHER ORDER?\"[/color]";
        
        this.choices = [
            new BasicTattooChoice(),
            new ElaborateTattooChoice(),
            new DeclineChoice()
        ];
    }
} 