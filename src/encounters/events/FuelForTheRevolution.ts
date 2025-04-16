/**
the stokers huddle conspiratorially near your wagon, clutching soot-stained pamphlets in clawed hands. red scarves flutter dramatically, horns gleaming earnestly beneath flat caps.

"comrade!" cries their leader, brandishing a thick stack of contraband titled infernal proletariat quarterly. "ze hour is nigh! ze workers of hell must cast off ze bloated leeches upstairs!" he points passionately toward brass towers, where corpulent industrialist demons puff cigars and guffaw villainously.

"smuggle zese pamphlets to our comrades in ze third circle," whispers another stoker fervently. "ze reward vill be vast—many sovereign notes. revolutionary notes!"

initial choices:
[accept revolutionary cargo, agreeing to deliver to third circle comrades]

[politely decline involvement]

initial outcomes:
accept revolutionary cargo:

you shake hands solemnly with stokers, hiding pamphlets beneath brimstone and coal. "ze fires of revolution burn brighter!" their leader sobs emotionally. "ze proletariat salutes your courage!" you nod, mostly thinking about the generous payday awaiting you down below.

as you begin loading the cargo, a corpulent shadow falls across you. management waddles forward—a grotesque devil in top hat and tails, monocle twinkling suspiciously, cigar smoke curling thickly around his chins.

"steady on, old sport," he drawls, eyeing your cargo knowingly. "got some dangerous stuff aboard, i hear. awful revolutionary drivel. tell you what," he puffs thoughtfully, "let me buy it off you instead—purely to see it safely burned, of course. handsome compensation, naturally."

the stokers watch anxiously from a distance, scarves fluttering uncertainly in furnace heat.

secondary choice (after accepting cargo):
[stick to your word, deliver literature to third circle comrades]

[sell literature directly to management (for burning)]

final outcomes:
stick to your word:

you politely decline the devil's offer, watching his chins quiver indignantly. "poor decision, chap. b___y british." he snorts, waddling off. the stokers cheer softly behind you, fists raised proudly beneath banners, as you depart toward the third circle and the promised payday.
(retain contraband literature cargo: sells for high price in third circle)

sell literature directly to management:

the stokers howl betrayal, pamphlets torn from trembling claws. management cackles triumphantly, stuffing notes into your hands. "splendid, old bean!  splendid!" he tosses pamphlets into flames, smiling smugly as propaganda crackles merrily away.
(gain immediate large cash reward)


 */

import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { RevolutionaryLiteratureCargo } from "../../gamecharacters/cargo/RevolutionaryLiteratureCargo";

// The initial choice to accept the revolutionary cargo
class AcceptCargoChoice extends AbstractChoice {
    constructor() {
        super(
            "Accept Revolutionary Cargo",
            "Agree to deliver the pamphlets to third circle comrades."
        );
        
        // This leads to a secondary event with two choices
        const secondaryEvent = new DeadEndEvent();
        secondaryEvent.description = "You shake hands solemnly with stokers, hiding pamphlets beneath brimstone and coal. \"Ze fires of revolution burn brighter!\" their leader sobs emotionally. \"Ze proletariat salutes your courage!\" You nod, mostly thinking about the generous payday awaiting you down below.\n\n" +
            "As you begin loading the cargo, a corpulent shadow falls across you. Management waddles forward—a grotesque devil in top hat and tails, monocle twinkling suspiciously, cigar smoke curling thickly around his chins.\n\n" +
            "[color=white]\"Steady on, old sport,\"[/color] he drawls, eyeing your cargo knowingly. [color=white]\"Got some dangerous stuff aboard, I hear. Awful revolutionary drivel. Tell you what,\"[/color] he puffs thoughtfully, [color=white]\"let me buy it off you instead—purely to see it safely burned, of course. Handsome compensation, naturally.\"[/color]\n\n" +
            "The stokers watch anxiously from a distance, scarves fluttering uncertainly in furnace heat.";
        
        secondaryEvent.choices = [
            new StickToWordChoice(),
            new SellToManagementChoice()
        ];
        
        this.nextEvent = secondaryEvent;
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        // No immediate effect - the secondary event will handle the outcomes
    }
}

// The secondary choice to stick to your word and deliver the cargo
class StickToWordChoice extends AbstractChoice {
    constructor() {
        super(
            "Stick to Your Word",
            "Deliver the literature to third circle comrades as promised."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "You politely decline the devil's offer, watching his chins quiver indignantly. [color=white]\"Poor decision, chap. B___y British.\"[/color] he snorts, waddling off. The stokers cheer softly behind you, fists raised proudly beneath banners, as you depart toward the third circle and the promised payday.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        // Add the revolutionary literature cargo to the player's deck
        const cargoCard = new RevolutionaryLiteratureCargo();
        this.actionManager().addCardToMasterDeck(cargoCard);
        this.actionManager().displaySubtitle(`Received ${cargoCard.name}`, 2000);
    }
}

// The secondary choice to sell the cargo to management
class SellToManagementChoice extends AbstractChoice {
    private goldReward: number = 100;

    constructor() {
        super(
            "Sell to Management",
            "Sell the literature directly to management for burning."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The stokers howl betrayal, pamphlets torn from trembling claws. Management cackles triumphantly, stuffing notes into your hands. [color=white]\"Splendid, old bean! Splendid!\"[/color] He tosses pamphlets into flames, smiling smugly as propaganda crackles merrily away.";
        this.mechanicalInformationText = `Gain ${this.goldReward} gold.`;
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        // Give the player immediate gold
        this.actionManager().modifySovereignInfernalNotes(this.goldReward);
        this.actionManager().displaySubtitle(`Gained ${this.goldReward} Hell Currency`, 2000);
    }
}

// The initial choice to decline involvement
class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "Politely Decline",
            "This seems like a good way to get in trouble."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "You shake your head apologetically. The stokers' eyes glimmer with disappointment, but they nod understanding. [color=white]\"Ze struggle continues, comrade, with or without your aid,\"[/color] sighs their leader, tucking pamphlets deeper into singed pockets. [color=white]\"Perhaps next time, your revolutionary consciousness will be more... awakened.\"[/color] They shuffle back toward smoldering furnaces, scarves drooping despondently in the hellish heat.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        // No effect from declining
    }
}

// The main event class
export class FuelForTheRevolution extends AbstractEvent {
    constructor() {
        super();
        this.name = "Fuel for the Revolution";
        this.portraitName = "placeholder_event_background_1";
        this.description = "The stokers huddle conspiratorially near your wagon, clutching soot-stained pamphlets in clawed hands. Red scarves flutter dramatically, horns gleaming earnestly beneath flat caps.\n\n" +
            "[color=white]\"Comrade!\"[/color] cries their leader, brandishing a thick stack of contraband titled [color=teal]Infernal Proletariat Quarterly[/color]. [color=white]\"Ze hour is nigh! Ze workers of hell must cast off ze bloated leeches upstairs!\"[/color] He points passionately toward brass towers, where corpulent industrialist demons puff cigars and guffaw villainously.\n\n" +
            "[color=white]\"Smuggle zese pamphlets to our comrades in ze third circle,\"[/color] whispers another stoker fervently. [color=white]\"Ze reward vill be vast—many sovereign notes. Revolutionary notes!\"[/color]";
        
        this.choices = [
            new AcceptCargoChoice(),
            new DeclineChoice()
        ];
    }
}