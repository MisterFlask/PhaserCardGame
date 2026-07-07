import { TargetingType } from "../AbstractCard";
import { BaseCharacter } from "../BaseCharacter";
import { EntityRarity } from "../EntityRarity";
import { PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";

/**
 * v1 trade-run cargo: a single mechanical body, unplayable, no effects. The
 * cost is purely deck dilution — it clogs a hand slot and a draw. No
 * exhaust, no sell value, no combat effect (see src/docs/trade_run_design.md,
 * "Explicitly out of scope for v1"). Cosmetic variants share this class and
 * differ only by display name/flavor, set via the constructor so the flavor
 * table in ContractGenerator can name region-appropriate freight without a
 * new class per good.
 */
/** Per-name flavor lines for the cosmetic freight labels below. Keyed off
 *  the exact display name so each crate variant gets its own line. */
const CARGO_FLAVOR_TEXT_BY_NAME: Readonly<Record<string, string>> = {
    "Reagent Barrel (Dis-bound)": "Manifest lists the contents as \"reagents.\" The manifest is being diplomatic.",
    "Opium Consignment (Brimstone Barons)": "The Barons pay on delivery and ask no questions. Best keep it that way.",
    "Crate of Spicy Literature (Garrison Order)": "The Garrison insists it's for troop morale. The troops are not complaining.",
};

export class TradeGoodsCargo extends PlayableCard {
    constructor(displayName: string = "Freight Crate") {
        super({
            name: displayName,
            cardType: CardType.NON_PLAYABLE,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 0;
        this.flavorText = CARGO_FLAVOR_TEXT_BY_NAME[displayName] ?? "";
    }

    override get description(): string {
        return "Unplayable. Dead weight — freight consigned for the run, not combat gear.";
    }

    override InvokeCardEffects(_target?: BaseCharacter): void { }

    override isUnplayable(): boolean { return true; }
}

/** Region/client-appropriate cosmetic labels for freight crates. Sortie-scoped
 *  cargo only ever needs a display name — see injectCargoIntoSquad. */
export const CARGO_FLAVOR_NAMES: readonly string[] = [
    "Reagent Barrel (Dis-bound)",
    "Opium Consignment (Brimstone Barons)",
    "Crate of Spicy Literature (Garrison Order)",
];
