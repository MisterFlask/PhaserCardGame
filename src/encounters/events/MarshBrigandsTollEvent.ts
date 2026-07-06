// Event: Marsh Brigands demanding toll
import { AbstractChoice, AbstractEvent, DeadEndEvent, DeadEndStartEncounterChoice } from "../../events/AbstractEvent";
import { Encounter } from "../EncounterManager";
import { Brigand } from "../monsters/act1_segment1/act1_segment0/Brigand";
import { ActionManagerFetcher } from "../../utils/ActionManagerFetcher";
import { AbstractConsumable } from "../../consumables/AbstractConsumable";

class FightThroughChoice extends DeadEndStartEncounterChoice {
    constructor() {
        const dummyEncounter = new Encounter([], 0, 0);
        super(
            "WIRE: Fight through.",
            dummyEncounter,
            "Order the attack. You've faced worse odds. Probably."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Damned if I'd pay tolls to scum with bits of windmill for a barricade. \"Morrison — full speed on my signal.\" The leader raised his rifle. \"Last chance, Company man!\" \"Now!\" I roared, from well behind the men.\n" +
            "— Cavendish";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        this.encounter.enemies = [new Brigand(), new Brigand(), new Brigand()];
        this.encounter.act = this.gameState().currentAct;
        this.encounter.segment = 0;
        super.effect();
    }
}

class PresentDocumentationChoice extends AbstractChoice {
    private consumable: AbstractConsumable | null;
    constructor() {
        const gameState = ActionManagerFetcher.getGameState();
        const consumable = gameState.consumables[0] ?? null;
        const desc = consumable
            ? `Hand over ${consumable.getDisplayName()}.`
            : "You have no kit to spare.";
        super(
            "WIRE: Buy passage with kit.",
            desc
        );
        this.consumable = consumable;
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Handed it across. The leader turned it over twice, weighing resale over spite, and waved us through. \"Fence it in Dis by Friday.\" Cheaper than coin, dearer than pride.\n" +
            "— Cavendish";
    }

    canChoose(): boolean {
        return this.consumable !== null;
    }

    effect(): void {
        const gameState = ActionManagerFetcher.getGameState();
        if (this.consumable) {
            const idx = gameState.consumables.indexOf(this.consumable);
            if (idx !== -1) {
                gameState.consumables.splice(idx, 1);
            }
        }
    }
}

class PayTollChoice extends AbstractChoice {
    private toll: number;
    constructor() {
        const gameState = ActionManagerFetcher.getGameState();
        const heads = gameState.currentRunCharacters.length;
        const price = 50 * heads;
        super(
            "WIRE: Pay the toll.",
            `Hand over £${price} to pass.`
        );
        this.toll = price;
        this.mechanicalInformationText = `Lose £${this.toll}.`;
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "\"We'll pay,\" I said, it costing me physical pain. Morrison counted out the toll like I'd grown a second head. Leader bit the coins, approved: \"Proper Company obols. Free to pass. Sundays we raid the dam works.\"\n" +
            "— Cavendish";
    }

    canChoose(): boolean {
        return this.gameState().moneyInVault >= this.toll;
    }

    effect(): void {
        this.actionManager().modifyMoney(-this.toll);
    }
}

export class MarshBrigandsTollEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "Marsh Toll Ambush";
        this.portraitName = "placeholder_event_background_1";
        this.description = "DISPATCH — marsh channel.\n" +
            "Barricade of scavenged junk blocks the crossing. Brigand leader, three uniforms' worth of deserter, gives us three options: ram the mined water, pay a toll per head, or surrender kit — \"even outcasts respect good equipment.\" Thompson's counting ammunition. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new FightThroughChoice(),
            new PresentDocumentationChoice(),
            new PayTollChoice()
        ];
    }
}
