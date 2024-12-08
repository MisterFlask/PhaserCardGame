import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { Lethality } from "../../gamecharacters/buffs/standard/Strong";
import { ActionManager } from "../../utils/ActionManager";

class BasicTattooChoice extends AbstractChoice {
    constructor() {
        super(
            "Accept the Basic Tattoo",
            "Your soldier gains some kind of buff permanently and 2 Stress."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The needle pierces your soldier's flesh with impossible geometries. Their mind recoils from the sensation as the angel's many-limbed form weaves patterns that shouldn't exist into their skin. When it's done, they stand stronger, though their dreams may never be the same.";
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
        this.nextEvent.description = "Time becomes meaningless as the angel's impossible hands work. Your soldier glimpses things no mortal was meant to see in the patterns being etched into their flesh. The resulting tattoo seems to shift and move when not directly observed. They emerge immensely stronger, though you suspect they've lost something ineffable in return.";
    }

    canChoose(): boolean {
        return this.gameState().hellCurrency >= 75;
    }

    effect(): void {
        const gameState = this.gameState();
        const character = gameState.currentRunCharacters[0];
        const actionManager = ActionManager.getInstance();
        
        actionManager.modifyHellCurrency(-75);
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
        this.nextEvent.description = "You make your excuses and back away with your soldier. The angel's impossible geometry seems to fold in on itself as you leave, and your soldier spends the next hour trying to convince themselves that what they saw was real.";
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
        this.description = "[color=yellow]In the twisted metal wastes, you and your soldier encounter what appears to be a tattoo parlor housed in a structure that defies euclidean geometry.[/color]\n\n" +
            "Inside, an [color=white]ANGEL[/color] tends to their tools - a being of such geometric complexity that your eyes water trying to comprehend its form. " +
            "Their many-limbed silhouette seems to fold through dimensions that shouldn't exist, each movement leaving trailing afterimages that burn themselves into your retinas.\n\n" +
            "The entity turns what might be its attention toward your soldier, and they feel a pressure behind their eyes as it communicates in frequencies that bypass their ears entirely: " +
            "[i]'YOUR FLESH IS AN ACCEPTABLE CANVAS FOR EXPRESSIONS OF THE DIVINE. SHALL WE BEGIN?'[/i]";
        
        this.choices = [
            new BasicTattooChoice(),
            new ElaborateTattooChoice(),
            new DeclineChoice()
        ];
    }
} 