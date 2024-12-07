import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";

class RestChoice extends AbstractChoice {
    constructor() {
        super(
            "Rest (Heal 20% HP)",
            "Heal all characters for 20% of their max HP"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "You take some time to rest and recover. The warmth of nearby hellfire soothes your wounds.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const gameState = this.gameState();
        gameState.currentRunCharacters.forEach(character => {
            const healAmount = Math.floor(character.maxHitpoints * 0.2);
            character.hitpoints = Math.min(character.maxHitpoints, character.hitpoints + healAmount);
        });
    }
}

class UpgradeChoice extends AbstractChoice {
    constructor() {
        super("Upgrade Deck", "Upgrade a card in your deck");
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Better weapon.  Cool.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        // I DON'T KNOW PLEASE HELP
    }
}

class ScavengeChoice extends AbstractChoice {
    constructor() {
        super(
            "Scavenge (Gain 30 Hell Currency)",
            "Search the area for resources"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "You search the area and find some valuable resources among the ashes and brimstone.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const gameState = this.gameState();
        gameState.hellCurrency += 30;
    }
}

export class RestEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "Rest Site";
        this.portraitName = "placeholder_event_background_2";
        this.description = "You've found a relatively safe spot to rest. The ambient heat from nearby hellfire provides a strange comfort. You could take this opportunity to recover, or search the area for resources.";
        this.choices = [
            new RestChoice(),
            new ScavengeChoice(),
        ];
    }
} 