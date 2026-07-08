import { AbstractStrategicProject } from "./AbstractStrategicProject";

// Capital Works Rebuild, second wave (July 2026) — see
// src/docs/strategic_layer_redesign.md's "Second wave" table (#11). Unlocks
// SELLING only: held consumables (QuartermasterPanel) and unequipped armoury
// relics (BarracksPanel's armoury picker) fetch 50% of list. Acquisition
// stays sortie-only — the relic-v1 ruling governs buying, not liquidation.
// Equipped relics cannot be sold (unequip first).
// Art lives in Sprites/StrategicProjects/wattle_gray_auctioneers.png (art
// pass, July 2026).
export const SALVAGE_SELL_FRACTION = 0.5;

export class WattleAndGraySalvageAuctioneers extends AbstractStrategicProject {
    constructor() {
        super({
            name: "Wattle & Gray, Salvage Auctioneers",
            description: "Unlocks selling: armoury relics and held consumables fetch [b]50%[/b] of list.",
            portraitName: "wattle_gray_auctioneers"
        });
        this.flavorText = "Everything the Company owns is for sale. This is a philosophy, not a clearance.";
    }

    public override getMoneyCost(): number {
        return 180;
    }
}
