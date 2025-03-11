import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { ActionManager } from "../../utils/ActionManager";

class AssetProtectionChoice extends AbstractChoice {
    constructor() {
        super(
            "Purchase Insurance Policy (Costs 50 Sovereign Infernal Notes)",
            "Protect a relic from loss for this run"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Contract drones swarm your inventory, encasing a relic in shimmering actuarial fields. The policy document manifests in your ledger, its clauses written in self-modifying legalese.";
    }

    canChoose(): boolean {
        return this.gameState().sovereignInfernalNotes >= 50 && 
               this.gameState().relicsInventory.length > 0;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        actionManager.modifySovereignInfernalNotes(-50);
        // TODO IMPLEMENT: Relic protection logic
    }
}

class ClaimsProcessingChoice extends AbstractChoice {
    constructor() {
        super(
            "File Lost Item Claim",
            "Chance to recover a previous relic (2 Stress)"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Endless forms materialize as claims adjusters debate your case. One finally produces a dust-covered relic from a probabalistic vault.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        // TODO IMPLEMENT: Relic recovery logic
    }
}

export class VaultworthTrustEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "Vaultworth Trust & Assurance";
        this.description = "A neoclassical marble hall filled with floating contracts. Robotic notaries patrol aisles of probability models, their calculations visible as ghostly actuarial tables.\n\n" +
            "A synthetic voice intones: [color=white]\"Risk mitigation services available. Premiums adjusted in real-time based on your survival probability.\"[/color]";
        this.choices = [new AssetProtectionChoice(), new ClaimsProcessingChoice()];
    }
} 