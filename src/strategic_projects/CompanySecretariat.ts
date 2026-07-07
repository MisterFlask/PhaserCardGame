// Capital Work (see src/docs/strategic_layer_redesign.md, "Amendment: Standing
// Orders" -> "Slot economy": "One additional slot purchasable as a Capital
// Work (Company Secretariat)."). A permanent, one-time, non-repeatable
// purchase; its bonusSlots effect is synced onto StandingOrdersState by
// CampaignUiState.syncStandingOrderBonusSlots() (called on purchase and on
// save load) rather than incremented here, since AbstractStrategicProject
// has no onPurchase hook and onQuarterEnd fires every quarter (which would
// double-count). Cost: amendment doesn't specify a figure, so this follows
// the brief's fallback (£250, one-time).

import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export class CompanySecretariat extends AbstractStrategicProject {
    constructor() {
        super({
            name: "Company Secretariat",
            description: "A permanent secretarial office to handle board paperwork, granting [b]+1 Standing Order slot[/b].",
            // No art yet; "" is the documented sentinel for "auto-generate a
            // placeholder" (see AssetManifestLint.test.ts / AbstractCard).
            portraitName: ""
        });
        this.surfacePurchaseValue = 250;
        this.flavorText = "Minute-book, notice: \"The board can now indulge one further standing folly without losing track of the others.\"";
    }

    public override getMoneyCost(): number {
        return 250;
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [StrategicResource.InfernalMachinery.ofQuantity(1)];
    }
}
