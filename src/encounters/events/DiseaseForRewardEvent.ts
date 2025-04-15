/**
 * 
 * the landscape is ulcerated with neatly arranged tents, a clinic nestled absurdly into the blistered flank of hell. your caravan halts. clog-footed figures shuffle eagerly forward, pristine lab coats stark against volcanic dust. One of your soldier's mutters "B___dy cloggers" under his breath; then, one notices you.

"ah, goedendag!" their leader greets you cheerfully, adjusting brass-framed spectacles that do nothing against the smoke. "you hef arrifed at a most oppurtune moment, mijn vrienden! ja, history in de making—met uw hulp, natuurlijk."

he gestures expansively. "ve are conductink a small, very controlled ekshperiment. ve vould like vun of your men to hef just a klein infection—nothing to vorry about. a touch of ze ashen flux. highly educational, yes?"

his assistant reveals a velvet-lined box, the interior obscured by the sickly glow of something potent—and likely infernal. "und naturlich, ve vill offer you vun of our... unique ekshperimental artefacts. a very rare specimen, ja? fascinating properties!"

he smiles reassuringly. "ze prognosis is very goed. almost entirely survivable. ve hef many... promising remedies."

the clogger beams expectantly, oblivious to your crew's discomfort, rocking gently on the absurd wooden shoes that somehow remain spotless amidst Hell's ashes.
 */

import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { AbstractRelic } from "../../relics/AbstractRelic";
import { RelicsLibrary } from "../../relics/RelicsLibrary";
import { ActionManager } from "../../utils/ActionManager";
import { getAllHellDiseases, getRandomHellDisease } from "./event_buffs/HellDiseases";

class AcceptDiseaseChoice extends AbstractChoice {
    private selectedRelic: AbstractRelic | null = null;

    constructor() {
        super(
            "Accept the 'Experiment'",
            "One of your soldiers will contract a disease, but you'll get a rare experimental artifact."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The clogger's eyes light up with excitement. \"Ja, excellent choice! Zeer goed!\" He gestures to his assistants, who draw forth needles and vials of sickly fluids. The procedure is mercifully quick, though deeply uncomfortable. Your soldier winces as the infection takes hold, but the cloggers insist it's \"perfectly manageable\" and \"only occasionally fatal.\" The lead researcher places the promised artifact in your hands, its surface warm with strange energies. \"For science, ja? A fair exchange!\"";
    }

    init(): void {
        // Select a relic when the choice is initialized
        this.selectedRelic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const gameState = this.gameState();
        const character = gameState.currentRunCharacters[0]; // Assumes first character is the soldier
        const actionManager = ActionManager.getInstance();
        
        // Apply random disease debuff
        const diseaseBuff = getRandomHellDisease(1);
        actionManager.applyBuffToCharacter(character, diseaseBuff);
        
        // Add the selected relic to inventory
        if (this.selectedRelic) {
            this.addLedgerItem(this.selectedRelic);
            actionManager.displaySubtitle(`Received ${this.selectedRelic.getDisplayName()}`, 2000);
        }
        
        // Display what disease was contracted
        actionManager.displaySubtitle(`Contracted ${diseaseBuff.getDisplayName()}`, 2000);
    }
}


class ExamineDiseaseChoice extends AbstractChoice {
    constructor() {
        super(
            "Ask About the Diseases",
            "Inquire about what diseases they're studying."
        );
        
        // Create a description that lists all the disease buffs
        const diseaseBuffs = getAllHellDiseases(1);
        let diseasesDescription = "The lead researcher brightens at your inquiry, adjusting his spectacles with enthusiasm. \"Ah, a fellow scientist, perhaps? Allow me to elucidate our current specimens!\"\n\n";
        
        // Add each disease description
        for (const buff of diseaseBuffs) {
            diseasesDescription += `[color=white]${buff.getDisplayName()}[/color]: "${buff.flavorText}" ${buff.getDescription()}\n\n`;
        }
        
        diseasesDescription += "He closes his ledger with a snap. \"Fascinating, nicht wahr? Each one is a little miracle of Hell's ecology. Now, shall we proceed with our arrangement?\"";
        
        this.nextEvent = new DiseaseForMoneyEvent();
        this.nextEvent.description = diseasesDescription;
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        // No permanent effect, just informational
    }
}

class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "Decline the Offer",
            "Refuse to participate in their experiment."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The clogger's smile falters, then fixes itself back into place with mechanical precision. \"Ah, a shame. Science marches on, however! Ve will find other... volunteers.\" He makes a small notation in his ledger as the other researchers begin collapsing their equipment with practiced efficiency. Within minutes, the entire operation is packed away, and the cloggers trudge off toward another part of Hell, their wooden shoes clacking on the ashen ground. Your soldiers visibly relax as they depart.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {}
}

export class DiseaseForMoneyEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Cloggers' Clinic";
        this.portraitName = "placeholder_event_background_1";
        this.description = "The landscape is ulcerated with neatly arranged tents, a clinic nestled absurdly into the blistered flank of hell. Your caravan halts. Clog-footed figures shuffle eagerly forward, pristine lab coats stark against volcanic dust. One of your soldier's mutters \"B___dy cloggers\" under his breath; then, one notices you.\n\n" +
            "[color=white]\"Ah, goedendag!\"[/color] their leader greets you cheerfully, adjusting brass-framed spectacles that do nothing against the smoke. [color=white]\"You hef arrifed at a most oppurtune moment, mijn vrienden! Ja, history in de making—met uw hulp, natuurlijk.\"[/color]\n\n" +
            "He gestures expansively. [color=white]\"Ve are conductink a small, very controlled ekshperiment. Ve vould like vun of your men to hef just a klein infection—nothing to vorry about. A touch of ze ashen flux. Highly educational, yes?\"[/color]\n\n" +
            "His assistant reveals a velvet-lined box, the interior obscured by the sickly glow of something potent—and likely infernal. [color=white]\"Und naturlich, ve vill offer you vun of our... unique ekshperimental artefacts. A very rare specimen, ja? Fascinating properties!\"[/color]\n\n" +
            "He smiles reassuringly. [color=white]\"Ze prognosis is very goed. Almost entirely survivable. Ve hef many... promising remedies.\"[/color]";
        
        this.choices = [
            new AcceptDiseaseChoice(),
            new ExamineDiseaseChoice(),
            new DeclineChoice()
        ];
    }
}

