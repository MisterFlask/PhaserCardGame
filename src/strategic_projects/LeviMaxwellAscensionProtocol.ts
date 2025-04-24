// A high-stakes metaphysical engineering endeavor to fundamentally alter the balance of dimensional pressures, permanently enlarging the Buckingham Rift for mass transit and the safe extraction of entire city-sized cargo shipments.

// Effect: ALL cargo you bring starts combat with 2 Light.

import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { Lightweight } from "../gamecharacters/buffs/playable_card/Lightweight";
import { CardType } from "../gamecharacters/Primitives";
import { GameState } from "../rules/GameState";
import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { AbyssalResearchInstitute } from "./AbyssalResearchInstitute";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export class LeviMaxwellAscensionProtocol extends AbstractStrategicProject {
    constructor() {
        super({
            name: "Levi-Maxwell Ascension Protocol",
            description: "ALL cargo you bring starts combat with 2 Light.",
            portraitName: "levi_maxwell_ascension"
        });
        this.surfacePurchaseValue = 300;
        this.flavorText = "The protocol disrupts the very fabric of dimensional space-time, creating a permanent breach in the Buckingham Rift. Massive cargo now flows with unprecedented efficiency, almost floating through the breach.";
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [
            StrategicResource.ObsidianSilk.ofQuantity(3),
            StrategicResource.WhiteflameDistillate.ofQuantity(2)
        ];
    }

    public override getPrerequisites(): AbstractStrategicProject[] {
        return [new AbyssalResearchInstitute()];
    }
}

export class LeviMaxwellAscensionProtocolBuff extends AbstractBuff {
    constructor() {
        super();
    }

    public override getDisplayName(): string {
        return "Levi-Maxwell Ascension Protocol";
    }

    public override getDescription(): string {
        return "ALL cargo you bring starts combat with 2 Light.";
    }

    override onCombatStart(): void {
        const gameState = GameState.getInstance();
        const allCards = [...gameState.combatState.drawPile, ...gameState.combatState.currentHand, ...gameState.combatState.currentDiscardPile];
        
        // Filter for cargo cards
        const cargoCards = allCards.filter(card => card.cardType === CardType.ITEM);
        
        // Apply Light buff to all cargo cards
        cargoCards.forEach(cargoCard => {
            this.actionManager.applyBuffToCard(cargoCard, new Lightweight(2));
        });
    }
}

