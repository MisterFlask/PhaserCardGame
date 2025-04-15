import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { PlayableCard } from "../../gamecharacters/PlayableCard";
import { ActionManager } from "../../utils/ActionManager";


class SovereignInfernalNotesExchangeChoice extends AbstractChoice {
    private selectedCargoCard: PlayableCard | null = null;

    constructor() {
        super(
            "Access Sovereign Infernal Notes Exchange Desk",
            "Trade a cargo item for Sovereign Infernal Notes"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Tellers in pinstripe suits appraise your cargo with unnatural precision. The air smells of ink and brimstone as your goods dissolve into shimmering currency.";
    }

    init(): void {
        const cargoCards = this.gameState().cargoHolder.cardsInMasterDeck;
        if (cargoCards.length > 0) {
            this.selectedCargoCard = cargoCards[Math.floor(Math.random() * cargoCards.length)];
            this.mechanicalInformationText = `Trade ${this.selectedCargoCard?.name} for 150 Sovereign Infernal Notes`;
        }
    }

    canChoose(): boolean {
        return this.gameState().cargoHolder.cardsInMasterDeck.length > 0;
    }

    effect(): void {
        if (!this.selectedCargoCard) return;
        
        const actionManager = ActionManager.getInstance();
        const cargoCards = this.gameState().cargoHolder.cardsInMasterDeck;
        
        // Remove the selected cargo card
        const cardIndex = cargoCards.findIndex(card => card.id === this.selectedCargoCard?.id);
        if (cardIndex !== -1) {
            this.gameState().cargoHolder.cardsInMasterDeck.splice(cardIndex, 1);
        }
        
        // Add Sovereign Infernal Notes
        actionManager.modifySovereignInfernalNotes(150);
    }
}

class LiquidityAssistanceChoice extends AbstractChoice {
    constructor() {
        super(
            "Request Liquidity Assistance",
            "Gain 50 Sovereign Infernal Notes"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The loan officer's monocle glints as they slide a contract across the desk. The small print writhes like living things.  You're pretty sure it's fine.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        actionManager.modifySovereignInfernalNotes(50);
    }
}

export class VaultworthFinancialEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "Vaultworth Financial Group";
        this.description = "A neoclassical banking hall where floating ledgers track infernal transactions in real-time. Robotic clerks shuffle between marble columns, their abacus-like appendages clicking furiously.\n\n" +
            "A manager adjusts their pince-nez: [color=white]\"Current interest rates at 6.66%. Would you care to discuss our premium wealth management services?\"[/color]";
        this.choices = [new SovereignInfernalNotesExchangeChoice(), new LiquidityAssistanceChoice()];
    }
} 