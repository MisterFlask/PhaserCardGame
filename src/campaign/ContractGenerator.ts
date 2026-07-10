import { Contract, ContractType } from "./Contract";
import { CONSUMABLE_REWARD_NAMES } from "./ConsumableStock";
import { StandingOrdersState } from "./orders/StandingOrdersState";
import { applyCharteredPartnerBonus } from "./ClientReputation";
import { OppositionId } from "./Oppositions";

/**
 * A contract template bundles name/client/description/paymentClause as one
 * coherent unit. Fields must never be mixed across templates — the whole
 * point is that a reader can tell who is paying and why from the notice
 * alone.
 */
interface ContractTemplate {
    name: string;
    client: string;
    /** Must state the client's economic stake in the task. */
    description: string;
    /** Invoice register; may contain the literal token {payout}. */
    paymentClause: string;
    /** Who the squad is nominally fighting (src/campaign/Oppositions.ts).
     *  Must belong to this template's own region's act (enforced by
     *  OppositionCoverageLint.test.ts). */
    opposition: OppositionId;
}

interface RegionFlavor {
    regionName: string;
    act: number;
    templates: ContractTemplate[];
}

const REGION_FLAVORS: RegionFlavor[] = [
    {
        regionName: "Styx Delta",
        act: 1,
        templates: [
            {
                // Revenue protection: toll income threatened.
                name: "Suppress the Boatmen's Picket",
                client: "The Styx Dam Project Office",
                description: "Guild ferrymen have declared certain channels 'closed for mourning'. Every idle barge costs the Project Office toll revenue it has already spent. The Company does not recognize mourning.",
                paymentClause: "{payout} on reopening of navigation, invoiced against the Project's works budget.",
                opposition: 'boatmens-guild',
            },
            {
                // Insurance mitigation: underwriter pays to stop claims.
                name: "Cull the Telegraph Eels",
                client: "Infernal Marine & Postal Underwriters, Ltd.",
                description: "Something in the reeds has been eating the mail. The mail is insured; the couriers are not. Our client would prefer to stop paying claims on both.",
                paymentClause: "{payout} on certified cessation of losses, per indemnity schedule 4.",
                opposition: 'delta-fauna',
            },
            {
                // Repossession: the asset itself is worth money.
                name: "Clear the Fare-Dodgers' Shoal",
                client: "Styx Delta Ferry & Lighterage Company",
                description: "A sandbar squatter camp has been boarding company barges without paying passage, and stripping the fittings when they disembark. The fittings are the expensive part.",
                paymentClause: "{payout} on recovery of fittings, less 10% adjuster's fee, per cargo-loss schedule 2.",
                opposition: 'squatters-salvage',
            },
            {
                // Political subsidy: outcome, not property.
                name: "Evict the Marsh Brigands",
                client: "The British Trade Delegation, Delta Office",
                description: "A brigand camp has set up within sight of the survey markers, which the Delegation finds diplomatically embarrassing during ongoing rift-access negotiations. Visibility, not violence, is the problem to be solved.",
                paymentClause: "{payout} on the camp's absence, drawn against the Delegation's discretionary fund.",
                opposition: 'squatters-salvage',
            },
            {
                // Insurance mitigation: reduce future claims by removing the hazard.
                name: "Punitive Action: Skeeterwisp Bloom",
                client: "Infernal Marine & Postal Underwriters, Ltd.",
                description: "A bloom of skeeterwisps has been swarming survey crews, and every stung surveyor is a disability claim on our client's books. Thinning the bloom is cheaper than paying out.",
                paymentClause: "{payout} on verified thinning, per indemnity schedule 4, addendum: vermin.",
                opposition: 'delta-fauna',
            },
            {
                // Revenue protection: the survey itself is the toll-generating asset.
                name: "Secure the Dam Survey Party's Retreat",
                client: "The Styx Dam Project Office",
                description: "The survey party has the turbine's flow readings, and the readings are worth nothing if the party doesn't reach the boat with them. The dam cannot be costed without this data, and an uncosted dam earns the Project Office nothing.",
                paymentClause: "{payout} on the party's safe return, invoiced against the Project's works budget.",
                opposition: 'delta-fauna',
            },
            {
                // Repossession/scientific stake: specimens are the paying asset.
                name: "Collect Specimens Along the Skeeterwisp Line",
                client: "De Koninklijke Wetenschappelijke Helrader Maatschappij",
                description: "The Maatschappij requires fresh specimens of the delta's fauna for the Rotterdam archives, live where practicable, intact where not. Our client stresses that 'intact' is the lower and considerably more achievable standard.",
                paymentClause: "{payout} on delivery to the collection agent, per the Maatschappij's standing specimen tariff.",
                opposition: 'delta-fauna',
            },
        ],
    },
    {
        regionName: "Deep France",
        act: 2,
        templates: [
            {
                // Political subsidy: deniability, not property.
                name: "Break the Old Guard Picquet",
                client: "Reichsinfernokorps Liaison Office",
                description: "The Emperor Undying's men have entrenched across a concession the Liaison Office would rather not admit exists. They require the trench cleared and their own involvement to remain unrecorded.",
                paymentClause: "{payout} on clearance, paid in cash, per the Office's usual arrangement: no paperwork.",
                opposition: 'grande-armee',
            },
            {
                // Insurance mitigation: fewer casualties, fewer claims.
                name: "Burn the Trench Ossuary",
                client: "Continental Casualty & Ossuary Underwriters",
                description: "The trenches produce nothing but casualties and paperwork, and the ossuary has begun producing revenants who file their own claims. Our client would like the second problem to stop before it becomes a precedent.",
                paymentClause: "{payout} on incineration, per indemnity schedule 9, revenant rider.",
                opposition: 'grande-armee',
            },
            {
                // Political subsidy: outcome desired for reasons of state.
                name: "Silence the Mitrailleuse Choir",
                client: "The British Trade Delegation, Continental Office",
                description: "A machine-gun emplacement has taken to firing in time with a hymn, which is unnerving the telegraph relay crew two miles back and delaying dispatches the Delegation needs sent by nightfall.",
                paymentClause: "{payout} on the guns falling silent, drawn against the Delegation's discretionary fund.",
                opposition: 'grande-armee',
            },
            {
                // Repossession: recovering an asset of direct value.
                name: "Intercept the Spectral Auditors",
                client: "Deep France Concession Holdings",
                description: "A patrol of the Emperor's revenant auditors has made off with the concession's boundary ledgers. Without the ledgers, Holdings cannot prove title to three parishes of mined-out trench frontage, and unproven title is unsellable title.",
                paymentClause: "{payout} on recovery of the ledgers, invoiced against the concession's title-defense reserve.",
                opposition: 'grande-armee',
            },
            {
                // Revenue protection: supply line for a paying operation.
                name: "Raid the Restauranteur's Larder",
                client: "Maison Vachon, Purveyors to the Front",
                description: "A rival quartermaster has been requisitioning Maison Vachon's supply carts at the crossroads, under color of martial law that does not, in fact, apply to caterers. Every requisitioned cart is a canceled dinner service and a refunded officers' mess contract.",
                paymentClause: "{payout} on the carts' return, per the Maison's standing supply agreement.",
                opposition: 'rear-echelon',
            },
            {
                // Insurance mitigation via demonstration of resolve, billed like a service.
                name: "Break the Wire at Verdigris Ridge",
                client: "Reichsinfernokorps Liaison Office",
                description: "Management requires a demonstration of resolve along the ridge line, chiefly so the Liaison Office can report progress to Berlin without further specifics. Resolve is billed hourly and the meter is already running.",
                paymentClause: "{payout} on demonstrated resolve, paid in cash, per the Office's usual arrangement: no paperwork.",
                opposition: 'grande-armee',
            },
        ],
    },
    {
        regionName: "Dis Foundry Belt",
        act: 3,
        templates: [
            {
                // Political subsidy: management wants an outcome, not an asset.
                name: "Suppress the Wildcat Strike",
                client: "Dis Foundry Belt Board of Overseers",
                description: "The Stoker's Union has walked off shift three furnaces early, and every idle furnace is heat the Board has already sold forward. The Board would like the furnaces staffed again, by whichever means prove necessary.",
                paymentClause: "{payout} on resumption of shift work, invoiced against the Board's production contingency.",
                opposition: 'stokers-union',
            },
            {
                // Repossession: the asset is worth money and the client wants it back.
                name: "Repossess the Furnace Row Machinery",
                client: "Brimstone Barons Equipment Leasing Consortium",
                description: "The Stoker's Union has occupied Company property and, worse from the Consortium's view, stopped making the lease payments on it. The property is on fire, but it is still leased property, and leased property gets repossessed.",
                paymentClause: "{payout} on recovery of the machinery, less depreciation, per lease-recovery schedule 1.",
                opposition: 'stokers-union',
            },
            {
                // Insurance mitigation: strikebreakers as a covered service.
                name: "Escort the Strikebreakers",
                client: "Dis Foundry Belt Board of Overseers",
                description: "The replacement crews are contracted, paid, and refusing to walk to the furnace floor unescorted, which is a labor cost the Board is accruing whether or not any labor occurs. Deliver them intact and the meter stops.",
                paymentClause: "{payout} on the crews reaching shift, invoiced against the Board's production contingency.",
                opposition: 'stokers-union',
            },
            {
                // Insurance mitigation: audit the source of claims before they're paid out.
                name: "Audit the Molten Agitators",
                client: "Continental Casualty & Ossuary Underwriters",
                description: "A rash of furnace-floor 'accidents' has produced more claims than the Union's own casualty numbers can explain. Our client suspects sabotage rather than misfortune, and sabotage is a category they don't have to pay out on if it can be proven.",
                paymentClause: "{payout} on a certified finding, per indemnity schedule 11, fraud investigation rider.",
                opposition: 'stokers-union',
            },
            {
                // Repossession: the office itself, and the paperwork inside it, are the asset.
                name: "Reclaim the Overseer's Office",
                client: "Brimstone Barons Equipment Leasing Consortium",
                description: "The Union has occupied the Overseer's office along with the machinery, and the office safe holds the original lease documents the Consortium needs to enforce the repossession in the first place. No documents, no claim.",
                paymentClause: "{payout} on recovery of the office and its contents, per lease-recovery schedule 1.",
                opposition: 'stokers-union',
            },
            {
                // Political subsidy: discretion is what's being purchased.
                // Flavor lightly clarified (2026-07, opposition tagging pass):
                // named the Company's own overseers as the discreet target so
                // the family a contract-biased sortie draws from is legible
                // from the notice (Barons wouldn't need discretion moving
                // against their own striking workforce -- that fight is
                // already public).
                name: "Satisfy the Brimstone Barons' Discretion",
                client: "The Brimstone Barons, jointly",
                description: "The Barons require a certain matter of Company overseers along Furnace Row resolved without their names appearing in the Board's minutes. The matter itself is unremarkable; the discretion is what costs money.",
                paymentClause: "{payout} on resolution, paid in cash, no minute taken.",
                opposition: 'company-men',
            },
            {
                // Political subsidy: the Union buys the Company's neutrality
                // as a service, same as any other client -- the joke being
                // that our billable hours have no politics.
                name: "Retain the Company Against Its Own Management",
                client: "The Stoker's Union, Amalgamated Chapters",
                description: "The Union wishes to retain the Company's services against certain of the Company's own overseers and repossession machinery, and finds nothing irregular in the request. Neither, on reflection, does the Company.",
                paymentClause: "{payout} on the Union's satisfaction, invoiced against Chapter dues, no questions raised on either side.",
                opposition: 'company-men',
            },
        ],
    },
    {
        regionName: "Brimstone Badlands",
        act: 4,
        templates: [
            {
                // Repossession: mineral rights are the disputed asset.
                name: "Settle the Vent-Field Claim",
                client: "The Brimstone Barons, jointly",
                description: "Two survey crews have staked the same fissure, and the Barons would prefer the matter settled by whoever is still standing rather than by the Concordat's arbitrators, who charge by the hour and side with neither party on principle.",
                paymentClause: "{payout} on undisputed possession, paid in cash, no minute taken.",
                opposition: 'barons-interests',
            },
            {
                // Political subsidy: access under a religious embargo. Not a
                // fight against the Choir itself -- a supply run past the
                // interdict, contested by whoever else the Barons' interests
                // put in the way of that delivery.
                name: "Provision the Choir Compound Under Interdict",
                client: "The Iron Choir, per its Concordat",
                description: "The compound has declared itself closed to secular trade for the duration of a rite the Concordat will not name. It still needs feeding. The Choir does not haggle and does not explain; it simply expects the crates to arrive.",
                paymentClause: "{payout} on delivery inside the wall, per the Concordat's own terms.",
                opposition: 'barons-interests',
            },
            {
                // Insurance mitigation: a runaway asset is a liability until stopped.
                name: "Shut Down the Runaway Extraction Engine",
                client: "Continental Casualty & Ossuary Underwriters",
                description: "A brimstone-boring engine has thrown its governor and is now extracting considerably more than its lease permits, in every direction at once. Every additional yard bored is a subsidence claim our client would rather not underwrite.",
                paymentClause: "{payout} on shutdown, per indemnity schedule 14, runaway-plant rider.",
                opposition: 'barons-interests',
            },
            {
                // Political subsidy: outcome (repatriation), not property.
                name: "Repatriate the Pilgrim Laborers",
                client: "The British Trade Delegation, Delta Office",
                description: "A contingent of indentured pilgrims has wandered off its assigned vent field and into a jurisdiction the Delegation is not presently prepared to explain to London. Their return, quietly, is the entire ask.",
                paymentClause: "{payout} on their return to the field, drawn against the Delegation's discretionary fund.",
                opposition: 'vent-fauna',
            },
            {
                // Revenue protection: the survey party's data is the paying asset.
                name: "Escort the Caldera Survey",
                client: "Brimstone Barons Equipment Leasing Consortium",
                description: "A leased survey team is mapping caldera pressure for the Consortium's next lease auction, and an auction without pressure data fetches auction prices for nothing in particular. The team walks; the escort is not optional.",
                paymentClause: "{payout} on the survey's safe return, per lease-recovery schedule 1.",
                opposition: 'vent-fauna',
            },
            {
                // Insurance mitigation: audit a religious levy before it's honored as a claim.
                name: "Audit the Concordat Tithe",
                client: "The Iron Choir, per its Concordat",
                description: "The Choir's tithe rolls show more brimstone leaving the compound than the compound's own extraction can account for, and the Concordat would like that discrepancy resolved before it becomes a subject for hymn. Discreetly, if possible.",
                paymentClause: "{payout} on a certified finding, per the Concordat's own terms.",
                opposition: 'iron-choir',
            },
        ],
    },
];

/** The Court of Directors: an internal client for Prestige Commissions only.
 *  Not a real trading partner — exempt from Chartered Partner/retainer
 *  tracking (CLIENT_RETAINER_ORDER_IDS has no entry for it, and it never
 *  will; house rule 6 keeps that registry the one place client->order
 *  mappings live, so simply never adding an entry here is sufficient — no
 *  exemption branch needed elsewhere). Contract.client bookkeeping
 *  (contractsCompletedByClient) still counts these completions harmlessly,
 *  per the design doc. */
const COURT_OF_DIRECTORS_CLIENT = "The Court of Directors";

/** Prestige Commission flavor: name + description only (payoutClause is
 *  fixed — see PRESTIGE_PAYMENT_CLAUSE — since these never pay in £). One
 *  table, not region-keyed: prestige work is commissioned directly by the
 *  Court, not tied to a region's local economy. */
const PRESTIGE_TEMPLATES: { name: string; description: string }[] = [
    {
        name: "Recover the Founders' Seal",
        description: "The Court wishes a matter of provenance settled: a seal of the Company's original charter, mislaid somewhere unbecoming. Its recovery reflects well on everyone who signs their name near it.",
    },
    {
        name: "Chart the Unclaimed Marches",
        description: "The Court's cartographers require a corridor of contested territory walked, mapped, and made presentable for the next shareholders' prospectus. Presentable, not necessarily pacified.",
    },
    {
        name: "Attend the Court's Correspondence",
        description: "A courier matter the Court considers beneath a formal contract but above ignoring: certain letters must arrive, certain parties must understand why. No invoice will be raised.",
    },
    {
        name: "Stand as the Court's Witness",
        description: "The Court requires a credible party present at a negotiation it would rather not be seen attending itself. Your presence is the entire service rendered.",
    },
];

const PRESTIGE_PAYMENT_CLAUSE = "The Court of Directors notes its satisfaction. It does not pay in anything so vulgar as money.";

interface TradeRunTemplate extends ContractTemplate {
    /** Cargo flavor, folded into the notice footer (e.g. "reagent barrels"). */
    cargoLabel: string;
}

interface TradeRunRegion {
    regionName: string;
    act: number;
    templates: TradeRunTemplate[];
}

/**
 * Freight-consignment flavor, one region-appropriate table per act. Trade
 * runs never mix a template's client/description/paymentClause across
 * entries (same discipline as REGION_FLAVORS above).
 */
const TRADE_RUN_REGIONS: TradeRunRegion[] = [
    {
        regionName: "Styx Delta",
        act: 1,
        templates: [
            {
                // Route hazard: the delta's fauna is what threatens barge traffic.
                name: "Reagent Barrels to the Dam Works",
                client: "The Styx Dam Project Office",
                description: "The Project Office has over-ordered curing reagent again and needs it moved before the quartermaster notices the invoice. Barge space is available; escort is not, officially.",
                paymentClause: "{payout} on delivery, plus carriage per barrel, invoiced against the Project's works budget.",
                cargoLabel: "reagent barrels",
                opposition: 'delta-fauna',
            },
            {
                // Route hazard: a discreet cargo avoids attention, chiefly
                // from whoever's squatting the channels it must pass.
                name: "Opium for the Brimstone Barons",
                client: "The Brimstone Barons, jointly",
                description: "A discreet consignment the Barons would rather arrive by contractor than by their own liveried barges, which draw attention the cargo cannot afford.",
                paymentClause: "{payout} on delivery, plus carriage per crate, paid in cash, no minute taken.",
                cargoLabel: "opium crates",
                opposition: 'squatters-salvage',
            },
            {
                // Explicit: the fare-dodgers are squatters-salvage.
                name: "Fittings for the Ferry Company",
                client: "Styx Delta Ferry & Lighterage Company",
                description: "Replacement fittings for the barges the fare-dodgers keep stripping. The Company would like them to arrive before the next boarding, not after.",
                paymentClause: "{payout} on delivery, plus carriage per crate, per cargo-loss schedule 2.",
                cargoLabel: "crated fittings",
                opposition: 'squatters-salvage',
            },
        ],
    },
    {
        regionName: "Deep France",
        act: 2,
        templates: [
            {
                // Template's own flavor: officers' mess / rear-area morale
                // trade, contested by the rear-echelon operators who run the
                // front's black-market supply.
                name: "Crates of Spicy Literature for the Garrisons",
                client: "Maison Vachon, Purveyors to the Front",
                description: "Morale material the officers' mess will not requisition through proper channels but will absolutely pay for through improper ones.",
                paymentClause: "{payout} on delivery, plus carriage per crate, per the Maison's standing supply agreement.",
                cargoLabel: "crates of spicy literature",
                opposition: 'rear-echelon',
            },
            {
                // Front-line delivery, straight into grande-armee-held trench country.
                name: "Revenant-Grade Coal to the Front",
                client: "Reichsinfernokorps Liaison Office",
                description: "The trenches burn coal faster than the Liaison Office can admit to Berlin. A contractor delivery leaves no requisition trail back to the discretionary fund.",
                paymentClause: "{payout} on delivery, plus carriage per sack, paid in cash, per the Office's usual arrangement: no paperwork.",
                cargoLabel: "coal sacks",
                opposition: 'grande-armee',
            },
            {
                // Explicit: the Spectral Auditors are grande-armee.
                name: "Ledger Copies for Concession Holdings",
                client: "Deep France Concession Holdings",
                description: "Duplicate boundary ledgers, in case the originals meet the Spectral Auditors again. Holdings would like a second copy somewhere the revenants cannot subpoena.",
                paymentClause: "{payout} on delivery, plus carriage per case, invoiced against the concession's title-defense reserve.",
                cargoLabel: "ledger cases",
                opposition: 'grande-armee',
            },
        ],
    },
    {
        regionName: "Dis Foundry Belt",
        act: 3,
        templates: [
            {
                // Explicit: moved before the Stoker's Union gets to it.
                name: "Copper Ingots off Furnace Row",
                client: "Brimstone Barons Equipment Leasing Consortium",
                description: "Smelted stock the Consortium wants off the books before the Stoker's Union works out it can be melted down into something more useful than ingots.",
                paymentClause: "{payout} on delivery, plus carriage per ingot crate, per lease-recovery schedule 1.",
                cargoLabel: "copper ingots",
                opposition: 'stokers-union',
            },
            {
                // Explicit: the Union may treat the cargo as evidence.
                name: "Sacred Relics for the Overseers",
                client: "Dis Foundry Belt Board of Overseers",
                description: "Reclaimed devotional relics from the Overseer's office, wanted upstairs before the Union decides they're evidence rather than heirlooms.",
                paymentClause: "{payout} on delivery, plus carriage per case, invoiced against the Board's production contingency.",
                cargoLabel: "relic cases",
                opposition: 'stokers-union',
            },
            {
                // Route hazard: foundry vermin are the ambient threat to a
                // supply cart, distinct from the Union's political dispute.
                name: "Alcohol Consignment for the Strikebreakers",
                client: "Dis Foundry Belt Board of Overseers",
                description: "Ration liquor for the replacement crews, who have made clear through their foreman that morale is a line item too.",
                paymentClause: "{payout} on delivery, plus carriage per barrel, invoiced against the Board's production contingency.",
                cargoLabel: "liquor barrels",
                opposition: 'foundry-vermin',
            },
        ],
    },
    {
        regionName: "Brimstone Badlands",
        act: 4,
        templates: [
            {
                // Route hazard: straight off the fissure, through vent-fauna territory.
                name: "Raw Brimstone off the Vent Field",
                client: "The Brimstone Barons, jointly",
                description: "Unrefined stock straight off the fissure, wanted at the Furnace Belt before the next lease auction resets the going rate out from under the Barons' feet.",
                paymentClause: "{payout} on delivery, plus carriage per crate, paid in cash, no minute taken.",
                cargoLabel: "brimstone crates",
                opposition: 'vent-fauna',
            },
            {
                // Destination client's own family: delivery inside the Choir's wall.
                name: "Blessed Bearing-Oil for the Choir",
                client: "The Iron Choir, per its Concordat",
                description: "A consecrated lubricant for the compound's machinery, blessed by whichever office within the Choir handles such things and unwilling to say which. The bells apparently seize without it.",
                paymentClause: "{payout} on delivery inside the wall, per the Concordat's own terms.",
                cargoLabel: "oil casks",
                opposition: 'iron-choir',
            },
            {
                // Explicit: the Choir's toll-men are the route hazard here.
                name: "Refined Phlogiston for the Barons",
                client: "Brimstone Barons Equipment Leasing Consortium",
                description: "Finished phlogiston stock, refined and volatile, that the Consortium would rather move by contractor wagon than by its own liveried convoys, which the Choir's toll-men have taken to inspecting rather too closely of late.",
                paymentClause: "{payout} on delivery, plus carriage per flask, per lease-recovery schedule 1.",
                cargoLabel: "phlogiston flasks",
                opposition: 'iron-choir',
            },
        ],
    },
];

/**
 * Dis Legation tuning constants (Capital Works Rebuild, July 2026 — see
 * src/docs/strategic_layer_redesign.md's amendment table #8). Defined HERE
 * rather than on TheDisLegation.ts because generateLegationContract consumes
 * them and campaign/ must never import strategic_projects/ (house rule 1:
 * AbstractStrategicProject is Phaser-tainted via AbstractCard).
 * TheDisLegation.ts re-exports them, so sim/tests can read them from either
 * module without drift.
 */
export const LEGATION_PAYOUT_MULTIPLIER = 1.4;
export const LEGATION_DEADLINE_WEEKS = 12;

/**
 * Soul Collateral Office escrow deadline (Capital Works Rebuild table #4).
 * Defined here for the same reason as the LEGATION constants above
 * (generateRecoveryContract consumes it; campaign/ can never import the
 * Phaser-tainted strategic_projects/); SoulCollateralOffice.ts re-exports it.
 */
export const ESCROW_DEADLINE_WEEKS = 8;

/**
 * Generates the weekly contract board. Difficulty scales with campaign year:
 * later years unlock deeper regions and harder encounter segments.
 */
export class ContractGenerator {
    private static instance: ContractGenerator;
    public static getInstance(): ContractGenerator {
        if (!ContractGenerator.instance) {
            ContractGenerator.instance = new ContractGenerator();
        }
        return ContractGenerator.instance;
    }
    private constructor() {}

    /** Fraction of generated contracts that carry a provisioning grant. */
    private static readonly CONSUMABLE_REWARD_CHANCE = 0.2;

    /** Balance-pass sketch numbers, tuned against CampaignSimulator.test.ts
     *  (see "baseline viability" describe block for the measured before/after).
     *  Hell's cost of living: enemies harden per year via EncounterHardening,
     *  so income should climb too, or the flat-per-act payout table plateaus
     *  once act 3 unlocks (year 6) while currentDividendExpectation keeps
     *  compounding — that mismatch was the root cause of the unwinnable
     *  40-quarter charter (0/10 seeds survived at any roster size, winRate
     *  0.9; see CampaignSimulator.test.ts pre-fix numbers). +9%/year past
     *  year 1 (year 1 = 1.0x exactly, so act-1/year-1 numbers are unchanged)
     *  roughly tracks HP_PER_YEAR's cadence in EncounterHardening.ts while
     *  leaving most of the late-charter gap to be closed by softening
     *  dividend escalation (CampaignCalendar), per the brief's lever
     *  preference order. */
    private static readonly PAYOUT_PER_YEAR = 0.05;

    /** Balance-pass sketch numbers, untested against the economy sim — see
     *  TODO.md "Standing Orders balance pass" for the convention. Revisit
     *  after a few played campaign-years. Lean crews draw danger pay because
     *  the same encounters get harder with fewer soldiers; big pushes dilute
     *  payout per head since the job is comparatively safer. */
    private static readonly SQUAD_SIZE_TWO_CHANCE = 0.2;
    private static readonly SQUAD_SIZE_FOUR_CHANCE = 0.2; // remainder (0.6) is squadSize 3
    private static readonly DANGER_PAY_MULTIPLIER: Record<number, number> = {
        2: 1.3,
        3: 1.0,
        4: 0.85,
    };

    /** Fraction of generated contracts that are trade runs (src/docs/trade_run_design.md). */
    private static readonly TRADE_RUN_CHANCE = 0.2;
    /** Trade runs pay a low base (half a normal contract's roll) plus a
     *  per-crate freight rate that scales with act. */
    private static readonly TRADE_RUN_BASE_PAYOUT_FRACTION = 0.5;
    private static readonly TRADE_RUN_FREIGHT_RATE_PER_ACT = 15;
    private static readonly TRADE_RUN_MAX_CRATES = 5;

    /** Prestige Commissions (src/docs/vp_endgame_design.md) unlock year 3+,
     *  trophies rather than a lane: at most one per full board refresh. */
    private static readonly PRESTIGE_MIN_YEAR = 3;
    /** Balance sketch (convention: EncounterHardening.ts:12-14): 150 base at
     *  year 3, +25 VP per year past that, rounded to £5-equivalent (nearest
     *  5 VP) — see the design doc's "Balance sketch" section for the
     *  vs-average-payout comparison this was sized against. Untested
     *  against the sim's actual VP economy; revisit after a few played
     *  campaign-years. */
    private static readonly PRESTIGE_VP_BASE = 150;
    private static readonly PRESTIGE_VP_PER_YEAR = 25;
    /** Chance a full board refresh (existing.length === 0) rolls a prestige
     *  slot at all, once past the year gate — "~1 per refresh at most", not
     *  guaranteed every refresh (these are rare trophies, not a lane). */
    private static readonly PRESTIGE_REFRESH_CHANCE = 0.5;

    /** Rolls squad size: 20% two-man, 60% three-man, 20% four-man.
     *  rng is injectable for deterministic tests (defaults to Math.random,
     *  same pattern as SortieResolution.ts's applyCasualties). */
    private rollSquadSize(rng: () => number): number {
        const roll = rng();
        if (roll < ContractGenerator.SQUAD_SIZE_TWO_CHANCE) return 2;
        if (roll < ContractGenerator.SQUAD_SIZE_TWO_CHANCE + ContractGenerator.SQUAD_SIZE_FOUR_CHANCE) return 4;
        return 3;
    }

    /** Trade runs never roll squadSize 2 (no hands to spare): 3 or 4 only,
     *  at the same relative 3:4 weighting as rollSquadSize (60% vs 20% of
     *  the full distribution), renormalized over {3, 4} alone — that's a
     *  75/25 three/four split, not the full distribution's raw 60/20. */
    private rollTradeRunSquadSize(rng: () => number): number {
        const fourChance = ContractGenerator.SQUAD_SIZE_FOUR_CHANCE
            / (1 - ContractGenerator.SQUAD_SIZE_TWO_CHANCE);
        return rng() < fourChance ? 4 : 3;
    }

    private pick<T>(arr: T[], rng: () => number): T {
        return arr[Math.floor(rng() * arr.length)];
    }

    /**
     * Highest act available. Deeper regions unlock by calendar year OR by
     * proven competence (contracts completed), whichever comes first — a
     * fast-playing company sees variety sooner instead of grinding the
     * Styx Delta for two full years.
     *
     * Balance sketch: longplay 2026-07 hit 28 contracts by year 2, unlocking
     * act 4 absurdly early. Adjusted to 56 ≈ year-7-equivalent throughput
     * (2 contracts/quarter × 28 quarters).
     */
    private maxActUnlocked(year: number, contractsCompleted: number): number {
        if (year >= 7 || contractsCompleted >= 56) return 4;
        if (year >= 6 || contractsCompleted >= 20) return 3;
        if (year >= 3 || contractsCompleted >= 8) return 2;
        return 1;
    }

    /** Shared bounty-style payout roll: deeper acts/segments and longer
     *  sorties pay more, Standing Orders adjust, danger pay adjusts last.
     *  Every pass re-rounds to £5 so the final figure is always a clean
     *  invoice number. `year` applies PAYOUT_PER_YEAR on top of the base so
     *  income keeps pace with dividend escalation and enemy hardening
     *  instead of plateauing once act 3 unlocks — see PAYOUT_PER_YEAR's
     *  comment. Exactly 1.0x at year 1, so act-1/year-1 numbers are
     *  unchanged from before this lever existed. */
    private rollBountyPayout(year: number, act: number, segment: number, numCombats: number, squadSize: number, rng: () => number): number {
        const basePay = 30 + act * 20 + segment * 25;
        const yearMultiplier = 1 + ContractGenerator.PAYOUT_PER_YEAR * Math.max(0, year - 1);
        const jitter = 0.85 + rng() * 0.3;
        const jitteredPayout = Math.round((basePay * yearMultiplier * numCombats * jitter) / 5) * 5;
        const standingOrdersPayout = Math.round(StandingOrdersState.getInstance().contractPayout(jitteredPayout) / 5) * 5;
        const dangerPayMultiplier = ContractGenerator.DANGER_PAY_MULTIPLIER[squadSize] ?? 1.0;
        return Math.round((standingOrdersPayout * dangerPayMultiplier) / 5) * 5;
    }

    private rollDeadlineWeeks(rng: () => number): number {
        return StandingOrdersState.getInstance()
            .contractDeadlineWeeks(2 + Math.floor(rng() * 3)); // 2-4 weeks on the board, base
    }

    private rollConsumableReward(rng: () => number): string | undefined {
        return rng() < ContractGenerator.CONSUMABLE_REWARD_CHANCE
            ? this.pick([...CONSUMABLE_REWARD_NAMES], rng)
            : undefined;
    }

    private generateBountyContract(region: RegionFlavor, year: number, contractsCompletedByClient: Record<string, number>, rng: () => number): Contract {
        const template = this.pick(region.templates, rng);

        // Segment within the act is the fine-grained difficulty dial.
        const segment = Math.floor(rng() * 3);
        const difficultyStars = segment + 1;

        const numCombats = rng() < 0.45 ? 1 : 2;
        const squadSize = this.rollSquadSize(rng);
        const rolledPayout = this.rollBountyPayout(year, region.act, segment, numCombats, squadSize, rng);
        // Chartered Partner (faction_reputation_design.md): applied after all
        // other payout passes (danger pay included, via rollBountyPayout),
        // re-rounded to £5.
        const payout = applyCharteredPartnerBonus(rolledPayout, template.client, contractsCompletedByClient);
        const deadlineWeeks = this.rollDeadlineWeeks(rng);
        const consumableRewardName = this.rollConsumableReward(rng);

        return new Contract({
            name: template.name,
            description: template.description,
            type: ContractType.BOUNTY,
            client: template.client,
            paymentClause: template.paymentClause.replace("{payout}", `£${payout}`),
            act: region.act,
            segment,
            difficultyStars,
            numCombats,
            deadlineWeeks,
            // Mustering and travel cost a week on top of the fighting; this
            // caps contract throughput so the dividend clock can actually bite.
            durationWeeks: numCombats + 1,
            payout,
            squadSize,
            regionName: region.regionName,
            consumableRewardName,
            opposition: template.opposition,
        });
    }

    /**
     * Trade run: low base payout + a per-crate freight rate the player
     * dials in at muster (see ContractBoardPanel's freight stepper).
     * `payout` on the Contract IS the low base (Contract.projectedPayout
     * adds cratesLoaded * freightRatePerCrate on top). Full-load act-1
     * example: ~£58 + 5x£15 = ~£133 vs ~£116 average combat contract —
     * a modest edge for 10 dead cards spread across three decks (balance
     * pass, see trade_run_design.md's "Numbers (post-nerf)" section for the
     * two signals — sim canary + longplay — that drove the cut from
     * £30/6 crates). Squad size never rolls 2 (no hands to spare): 3 or 4
     * only.
     */
    private generateTradeRunContract(region: TradeRunRegion, year: number, contractsCompletedByClient: Record<string, number>, rng: () => number): Contract {
        const template = this.pick(region.templates, rng);

        const segment = Math.floor(rng() * 3);
        const difficultyStars = segment + 1;
        const numCombats = rng() < 0.45 ? 1 : 2;
        const squadSize = this.rollTradeRunSquadSize(rng);

        const normalPayoutRoll = this.rollBountyPayout(year, region.act, segment, numCombats, squadSize, rng);
        const rolledBasePayout = Math.round((normalPayoutRoll * ContractGenerator.TRADE_RUN_BASE_PAYOUT_FRACTION) / 5) * 5;
        // Chartered Partner (faction_reputation_design.md): applied after all
        // other payout passes, re-rounded to £5 — same pass as the bounty path.
        const basePayout = applyCharteredPartnerBonus(rolledBasePayout, template.client, contractsCompletedByClient);
        // Preferred Lading Rates retainer (freight bump, faction_reputation_design.md
        // "NEW HOOK (freight)"): flat £ added at generation, same
        // consult-StandingOrdersState pattern as every other generator lever.
        const freightRatePerCrate = StandingOrdersState.getInstance()
            .freightRatePerCrate(ContractGenerator.TRADE_RUN_FREIGHT_RATE_PER_ACT * region.act);
        const maxCrates = ContractGenerator.TRADE_RUN_MAX_CRATES;

        const deadlineWeeks = this.rollDeadlineWeeks(rng);
        const consumableRewardName = this.rollConsumableReward(rng);

        return new Contract({
            name: template.name,
            description: template.description,
            type: ContractType.TRADE_RUN,
            client: template.client,
            paymentClause: template.paymentClause.replace("{payout}", `£${basePayout}`),
            act: region.act,
            segment,
            difficultyStars,
            numCombats,
            deadlineWeeks,
            durationWeeks: numCombats + 1,
            payout: basePayout,
            squadSize,
            regionName: region.regionName,
            consumableRewardName,
            maxCrates,
            freightRatePerCrate,
            opposition: template.opposition,
        });
    }

    /**
     * Prestige Commission: £0 payout, vpReward instead. Draws act/segment
     * from the same unlocked-region pool as a bounty contract (it still
     * needs a real encounter table and a squad-size/danger-pay roll), but
     * its client, description, and payment clause are fixed to the Court of
     * Directors rather than drawn from REGION_FLAVORS — this is a trophy
     * commissioned directly by the Court, not a region's local economy.
     * vpReward scales with year (PRESTIGE_VP_BASE + PRESTIGE_VP_PER_YEAR per
     * year past PRESTIGE_MIN_YEAR) and gets the same danger-pay multiplier a
     * bounty payout would (DANGER_PAY_MULTIPLIER), applied to VP instead of
     * £, then rounded to the nearest 5 — see design doc "Payout: £0" clause.
     */
    private generatePrestigeContract(year: number, maxAct: number, rng: () => number): Contract {
        const region = this.pick(REGION_FLAVORS.filter(r => r.act <= maxAct), rng);
        const template = this.pick(PRESTIGE_TEMPLATES, rng);

        const segment = Math.floor(rng() * 3);
        const difficultyStars = segment + 1;
        const numCombats = rng() < 0.45 ? 1 : 2;
        const squadSize = this.rollSquadSize(rng);

        const baseVp = ContractGenerator.PRESTIGE_VP_BASE
            + ContractGenerator.PRESTIGE_VP_PER_YEAR * Math.max(0, year - ContractGenerator.PRESTIGE_MIN_YEAR);
        const dangerPayMultiplier = ContractGenerator.DANGER_PAY_MULTIPLIER[squadSize] ?? 1.0;
        const vpReward = Math.round((baseVp * dangerPayMultiplier) / 5) * 5;

        const deadlineWeeks = this.rollDeadlineWeeks(rng);

        return new Contract({
            name: template.name,
            description: template.description,
            type: ContractType.PRESTIGE,
            client: COURT_OF_DIRECTORS_CLIENT,
            paymentClause: PRESTIGE_PAYMENT_CLAUSE,
            act: region.act,
            segment,
            difficultyStars,
            numCombats,
            deadlineWeeks,
            durationWeeks: numCombats + 1,
            payout: 0,
            squadSize,
            regionName: region.regionName,
            vpReward,
        });
    }

    /**
     * Legation commission (Capital Works Rebuild table #8, The Dis Legation):
     * one ordinary bounty contract at the CURRENT best act — reusing
     * maxActUnlocked and the existing region/template plumbing, no
     * special-case templates — then adjusted: payout ×LEGATION_PAYOUT_MULTIPLIER
     * (rounded to integer £), a fixed LEGATION_DEADLINE_WEEKS deadline, the
     * board-slot exemption flag, and a "Legation: " name prefix. Trade-run
     * and prestige generation paths are deliberately untouched.
     */
    public generateLegationContract(
        year: number, contractsCompleted: number = 0, contractsCompletedByClient: Record<string, number> = {},
        rng: () => number = Math.random
    ): Contract {
        const maxAct = this.maxActUnlocked(year, contractsCompleted);
        const region = REGION_FLAVORS.find(r => r.act === maxAct)!;
        const contract = this.generateBountyContract(region, year, contractsCompletedByClient, rng);

        const basePayout = contract.payout;
        contract.payout = Math.round(basePayout * LEGATION_PAYOUT_MULTIPLIER);
        // The bounty path already substituted {payout} with the pre-multiplier
        // figure; keep the invoice honest (clause must always quote the actual
        // payout — see ContractGenerator.test.ts's payment-clause invariant).
        contract.paymentClause = contract.paymentClause.replace(`£${basePayout}`, `£${contract.payout}`);
        contract.deadlineWeeks = LEGATION_DEADLINE_WEEKS;
        contract.exemptFromBoardSlots = true;
        contract.name = `Legation: ${contract.name}`;
        return contract;
    }

    /**
     * Recovery of Company Assets (Capital Works Rebuild table #4, The Soul
     * Collateral Office): posts when soldiers die on a WON sortie while the
     * Office is owned. Reuses the bounty plumbing for act-appropriate
     * encounter/squad fields (act = the sortie the souls were lost on), then
     * overrides the commercial terms: £0 payout, no VP, a fixed
     * ESCROW_DEADLINE_WEEKS deadline, board-slot exemption, and the Office's
     * own name/client/clause. recoveryOfSouls carries the escrowed names;
     * SortieManager.resolveSortie redeems them on completion and
     * CampaignUiState.advanceWeeks forfeits them on expiry.
     */
    public generateRecoveryContract(soulNames: string[], act: number, rng: () => number = Math.random): Contract {
        const region = REGION_FLAVORS.find(r => r.act === act) ?? REGION_FLAVORS[0];
        const contract = this.generateBountyContract(region, 1, {}, rng);

        const namesList = soulNames.join(", ");
        contract.name = soulNames.length > 1
            ? `Recovery of Company Assets: ${soulNames[0]} (and ${soulNames.length - 1} ${soulNames.length - 1 === 1 ? 'other' : 'others'})`
            : `Recovery of Company Assets: ${soulNames[0]}`;
        contract.client = "The Soul Collateral Office";
        contract.description = `The Office holds ${namesList} in escrow pending physical recovery. `
            + `The souls in question are Company property under clause 44(b); their prior owners are invited to reclaim them by force.`;
        contract.paymentClause = "No invoice will be raised. The Company does not pay to be returned its own property.";
        contract.payout = 0;
        contract.vpReward = 0;
        contract.deadlineWeeks = ESCROW_DEADLINE_WEEKS;
        contract.exemptFromBoardSlots = true;
        contract.recoveryOfSouls = [...soulNames];
        contract.consumableRewardName = undefined; // no provisioning grants on escrow work
        return contract;
    }

    /** rng is injectable for deterministic tests (defaults to Math.random,
     *  same pattern as SortieResolution.ts's applyCasualties) — threaded
     *  through as a plain parameter rather than stored as instance state,
     *  since this class is a shared process-wide singleton. */
    public generateContract(
        year: number, contractsCompleted: number = 0, contractsCompletedByClient: Record<string, number> = {},
        rng: () => number = Math.random
    ): Contract {
        const maxAct = this.maxActUnlocked(year, contractsCompleted);

        if (rng() < ContractGenerator.TRADE_RUN_CHANCE) {
            const eligibleTradeRegions = TRADE_RUN_REGIONS.filter(r => r.act <= maxAct);
            return this.generateTradeRunContract(this.pick(eligibleTradeRegions, rng), year, contractsCompletedByClient, rng);
        }

        const eligibleRegions = REGION_FLAVORS.filter(r => r.act <= maxAct);
        return this.generateBountyContract(this.pick(eligibleRegions, rng), year, contractsCompletedByClient, rng);
    }

    /** Top the board back up to targetCount contracts (adjusted by Standing
     *  Orders). At least one trade run per full board refresh (starting
     *  from an empty board) so the axis is always available, even though
     *  each contract only independently rolls ~20% odds. rng is injectable
     *  for deterministic tests (defaults to Math.random) — see
     *  generateContract's doc comment.
     *
     *  Slot-exempt contracts (Contract.exemptFromBoardSlots, e.g. Legation
     *  commissions) raise the effective target by their own count, so they
     *  never squeeze the public board's refill — the board always tops up
     *  to targetCount NON-exempt contracts. */
    public refillBoard(
        existing: Contract[], year: number, contractsCompleted: number = 0, targetCount: number = 5,
        contractsCompletedByClient: Record<string, number> = {}, rng: () => number = Math.random
    ): Contract[] {
        const board = [...existing];
        const exemptCount = existing.filter(c => c.exemptFromBoardSlots).length;
        const adjustedTarget = StandingOrdersState.getInstance().contractBoardTarget(targetCount) + exemptCount;
        const isFullRefresh = existing.length === 0;
        while (board.length < adjustedTarget) {
            board.push(this.generateContract(year, contractsCompleted, contractsCompletedByClient, rng));
        }
        if (isFullRefresh && board.length > 0 && !board.some(c => c.isTradeRun)) {
            const maxAct = this.maxActUnlocked(year, contractsCompleted);
            const eligibleTradeRegions = TRADE_RUN_REGIONS.filter(r => r.act <= maxAct);
            board[board.length - 1] = this.generateTradeRunContract(this.pick(eligibleTradeRegions, rng), year, contractsCompletedByClient, rng);
        }

        // Prestige Commissions: year 3+, ~1 per full board refresh at most
        // (rare trophies, not a lane — see design doc). Never displaces the
        // guaranteed trade run above; only rolled on a full refresh from
        // empty, and only if the board doesn't already carry one (a partial
        // top-up of an existing board with a prestige contract still on it
        // does not roll another).
        if (isFullRefresh && board.length > 0 && year >= ContractGenerator.PRESTIGE_MIN_YEAR
            && !board.some(c => c.isPrestige) && rng() < ContractGenerator.PRESTIGE_REFRESH_CHANCE) {
            const maxAct = this.maxActUnlocked(year, contractsCompleted);
            const replaceIdx = board.findIndex(c => !c.isTradeRun);
            if (replaceIdx >= 0) {
                board[replaceIdx] = this.generatePrestigeContract(year, maxAct, rng);
            }
        }
        return board;
    }

    /** Exposed for tests. */
    public static getAllTradeRunTemplates(): TradeRunTemplate[] {
        return TRADE_RUN_REGIONS.flatMap(r => r.templates);
    }

    /** Exposed for tests. */
    public static getAllPrestigeTemplates(): { name: string; description: string }[] {
        return PRESTIGE_TEMPLATES;
    }

    /**
     * Exposed for tests: verifies that name/client/description/paymentClause
     * always co-occur as defined in a single template (never mixed across
     * templates by the generator).
     */
    public static getAllTemplates(): ContractTemplate[] {
        return REGION_FLAVORS.flatMap(r => r.templates);
    }
}
