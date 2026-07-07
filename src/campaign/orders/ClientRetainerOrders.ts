// Client-retainer Standing Orders (src/docs/faction_reputation_design.md,
// "Retainer canon"). Each unlocks after CLIENT_RETAINER_UNLOCK_THRESHOLD
// completed contracts for its client (CampaignUiState.CLIENT_RETAINER_ORDER_IDS
// is the one place the client-to-order mapping lives — house rule 6). Class
// pattern and rounding convention match LaunchOrders.ts.

import { StandingOrder } from "./StandingOrder";

function roundToFive(n: number): number {
    return Math.round(n / 5) * 5;
}

export class CivilWorksSchedule extends StandingOrder {
    public readonly id = "civil-works-schedule";
    public readonly name = "Civil Works Schedule";
    public readonly description = "A standing schedule with the Project Office adds [b]1 week[/b] to every contract deadline: civil engineers, it turns out, are no more punctual as clients than as builders.";
    public readonly flavor = "Memo, Project Office letterhead: \"The dam was also late. We understand.\"";

    public modifyContractDeadlineWeeks(w: number): number { return w + 1; }
}

export class UnderwritingRetainer extends StandingOrder {
    public readonly id = "underwriting-retainer";
    public readonly name = "Underwriting Retainer";
    public readonly description = "Infernal Marine & Postal Underwriters carries the Company on a standing policy: on a squad-wipe contract failure, the Company recovers [b]50%[/b] of that contract's payout as an indemnity settlement.";
    public readonly flavor = "Adjuster's stamp: \"Total loss confirmed. Settlement enclosed. Do try to insure the men next time, not just the cargo.\"";

    public wipeInsurancePayout(contractPayout: number): number { return roundToFive(contractPayout * 0.5); }
}

export class PreferredLadingRates extends StandingOrder {
    public readonly id = "preferred-lading-rates";
    public readonly name = "Preferred Lading Rates";
    public readonly description = "The Ferry & Lighterage Company quotes the Company a preferred lading rate: trade-run freight pays [b]£10 more per crate[/b].";
    public readonly flavor = "Wharfage ledger: \"Regular custom earns a regular rate. Irregular custom pays for the privilege.\"";

    public modifyFreightRatePerCrate(rate: number): number { return rate + 10; }
}

export class OfficersMessAccount extends StandingOrder {
    public readonly id = "officers-mess-account";
    public readonly name = "Officers' Mess Account";
    public readonly description = "A standing account with Maison Vachon keeps the mess well-stocked and the surgeons better-fed, shaving [b]1 week[/b] off recovery time for new wounds (never below 1 week).";
    public readonly flavor = "Invoice, Maison Vachon: \"A convalescent digests better than a soldier. We bill accordingly.\"";

    public modifyWoundWeeks(w: number): number { return Math.max(1, w - 1); }
}

export class PlantAndEquipmentLease extends StandingOrder {
    public readonly id = "plant-and-equipment-lease";
    public readonly name = "Plant & Equipment Lease";
    public readonly description = "The Brimstone Barons Equipment Leasing Consortium extends the Company preferred hire terms, cutting recruitment cost by [b]25%[/b]. Recruits arrive already billed as leased assets.";
    public readonly flavor = "Lease schedule, Consortium seal: \"Depreciates like any other asset. Please do not lease out again without a rider.\"";

    public modifyRecruitCost(c: number): number { return roundToFive(c * 0.75); }
}

export class OssuaryDeathBenefit extends StandingOrder {
    public readonly id = "ossuary-death-benefit";
    public readonly name = "Ossuary Death Benefit";
    public readonly description = "Continental Casualty & Ossuary Underwriters underwrites the Company's soldiers directly: [b]£40[/b] is remitted to the vault for every Company death, the Company itself being the named beneficiary.";
    public readonly flavor = "Board minute: \"Casualty benefit remitted: £40. The Company thanks the deceased for their custom.\"";

    public deathBenefitPerCasualty(): number { return 40; }
}

/** Client-retainer pool, in a stable order. Registered into
 *  STANDING_ORDER_REGISTRY alongside LAUNCH_ORDERS (see StandingOrdersState).
 *  Add new retainers here, and map their client in CampaignUiState's
 *  CLIENT_RETAINER_ORDER_IDS — never by id-branch (house rule 6). */
export const CLIENT_RETAINER_ORDERS: StandingOrder[] = [
    new CivilWorksSchedule(),
    new UnderwritingRetainer(),
    new PreferredLadingRates(),
    new OfficersMessAccount(),
    new PlantAndEquipmentLease(),
    new OssuaryDeathBenefit(),
];
