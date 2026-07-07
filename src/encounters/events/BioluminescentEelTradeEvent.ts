import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { MistBottle } from "../../relics/common/MistBottle";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";

class BuyTheEelsChoice extends AbstractChoice {
    private cost = 25;
    constructor() {
        super(
            "WIRE: Buy the eels. £25.",
            "Purchase a barrel of glowing eels from the outpost trader."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The barrel hums faintly, lighting the crawler's hold an unsettling green. Trader assured us they're \"mostly decorative.\" Jenkins has already named one. This will end predictably.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return this.gameState().moneyInVault >= this.cost; }
    effect(): void {
        this.actionManager().modifyMoney(-this.cost);
        const relic = new MistBottle();
        this.addLedgerItem(relic);
        this.actionManager().displaySubtitle(`Received ${relic.getDisplayName()}`, 2000);
    }
}

class HandleThemBareHandedChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Free sample. Bare hands.",
            "Take the trader's free sample. One man gains 1 Stress."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The eel latched on before Morrison could think better of it. It let go on its own after a minute, apparently satisfied, leaving a faint phosphorescent burn and a lesson learned.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const character = this.getEventCharacter(2);
        this.actionManager().applyBuffToCharacter(character, new Stress(1));
    }
}

class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Decline. Keep moving.",
            "Glowing eels are someone else's problem."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The trader shrugged and returned to sorting his barrels by luminosity, entirely unbothered by our refusal. A wise policy, probably, given the eels.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {}
}

export class BioluminescentEelTradeEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Eel Trader's Outpost";
        this.portraitName = "placeholder_event_background_1";
        this.description = "DISPATCH — Styx Delta, soul-trading outpost.\n" +
            "A trader deals exclusively in glowing eels, pulled from the delta's dark water and kept in barrels that light the whole dock green. He swears they're useful for \"navigation, mostly,\" and offers a free sample to skeptics. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new BuyTheEelsChoice(),
            new HandleThemBareHandedChoice(),
            new DeclineChoice()
        ];
    }
}
