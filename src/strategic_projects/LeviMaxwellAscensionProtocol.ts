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
            portraitName: "levi_maxwell_ascension_protocol"
        });
        this.surfacePurchaseValue = 300;
        this.flavorText = "A mysterious protocol that enhances the combat capabilities of your cargo.";
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [
            StrategicResource.Hush.ofQuantity(2),
            StrategicResource.WhiteflameDistillate.ofQuantity(1)
        ];
    }

    public override getPrerequisites(): AbstractStrategicProject[] {
        return [new AbyssalResearchInstitute()];
    }

    public override postProcessCampaignStateAfterRun(): void {
        // ALL cargo you bring starts combat with 2 Light
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

