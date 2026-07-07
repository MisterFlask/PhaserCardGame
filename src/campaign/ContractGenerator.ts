import { Contract, ContractType } from "./Contract";
import { CONSUMABLE_REWARD_NAMES } from "./ConsumableStock";
import { StandingOrdersState } from "./orders/StandingOrdersState";

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
            },
            {
                // Insurance mitigation: underwriter pays to stop claims.
                name: "Cull the Telegraph Eels",
                client: "Infernal Marine & Postal Underwriters, Ltd.",
                description: "Something in the reeds has been eating the mail. The mail is insured; the couriers are not. Our client would prefer to stop paying claims on both.",
                paymentClause: "{payout} on certified cessation of losses, per indemnity schedule 4.",
            },
            {
                // Repossession: the asset itself is worth money.
                name: "Clear the Fare-Dodgers' Shoal",
                client: "Styx Delta Ferry & Lighterage Company",
                description: "A sandbar squatter camp has been boarding company barges without paying passage, and stripping the fittings when they disembark. The fittings are the expensive part.",
                paymentClause: "{payout} on recovery of fittings, less 10% adjuster's fee, per cargo-loss schedule 2.",
            },
            {
                // Political subsidy: outcome, not property.
                name: "Evict the Marsh Brigands",
                client: "The British Trade Delegation, Delta Office",
                description: "A brigand camp has set up within sight of the survey markers, which the Delegation finds diplomatically embarrassing during ongoing rift-access negotiations. Visibility, not violence, is the problem to be solved.",
                paymentClause: "{payout} on the camp's absence, drawn against the Delegation's discretionary fund.",
            },
            {
                // Insurance mitigation: reduce future claims by removing the hazard.
                name: "Punitive Action: Skeeterwisp Bloom",
                client: "Infernal Marine & Postal Underwriters, Ltd.",
                description: "A bloom of skeeterwisps has been swarming survey crews, and every stung surveyor is a disability claim on our client's books. Thinning the bloom is cheaper than paying out.",
                paymentClause: "{payout} on verified thinning, per indemnity schedule 4, addendum: vermin.",
            },
            {
                // Revenue protection: the survey itself is the toll-generating asset.
                name: "Secure the Dam Survey Party's Retreat",
                client: "The Styx Dam Project Office",
                description: "The survey party has the turbine's flow readings, and the readings are worth nothing if the party doesn't reach the boat with them. The dam cannot be costed without this data, and an uncosted dam earns the Project Office nothing.",
                paymentClause: "{payout} on the party's safe return, invoiced against the Project's works budget.",
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
            },
            {
                // Insurance mitigation: fewer casualties, fewer claims.
                name: "Burn the Trench Ossuary",
                client: "Continental Casualty & Ossuary Underwriters",
                description: "The trenches produce nothing but casualties and paperwork, and the ossuary has begun producing revenants who file their own claims. Our client would like the second problem to stop before it becomes a precedent.",
                paymentClause: "{payout} on incineration, per indemnity schedule 9, revenant rider.",
            },
            {
                // Political subsidy: outcome desired for reasons of state.
                name: "Silence the Mitrailleuse Choir",
                client: "The British Trade Delegation, Continental Office",
                description: "A machine-gun emplacement has taken to firing in time with a hymn, which is unnerving the telegraph relay crew two miles back and delaying dispatches the Delegation needs sent by nightfall.",
                paymentClause: "{payout} on the guns falling silent, drawn against the Delegation's discretionary fund.",
            },
            {
                // Repossession: recovering an asset of direct value.
                name: "Intercept the Spectral Auditors",
                client: "Deep France Concession Holdings",
                description: "A patrol of the Emperor's revenant auditors has made off with the concession's boundary ledgers. Without the ledgers, Holdings cannot prove title to three parishes of mined-out trench frontage, and unproven title is unsellable title.",
                paymentClause: "{payout} on recovery of the ledgers, invoiced against the concession's title-defense reserve.",
            },
            {
                // Revenue protection: supply line for a paying operation.
                name: "Raid the Restauranteur's Larder",
                client: "Maison Vachon, Purveyors to the Front",
                description: "A rival quartermaster has been requisitioning Maison Vachon's supply carts at the crossroads, under color of martial law that does not, in fact, apply to caterers. Every requisitioned cart is a canceled dinner service and a refunded officers' mess contract.",
                paymentClause: "{payout} on the carts' return, per the Maison's standing supply agreement.",
            },
            {
                // Insurance mitigation via demonstration of resolve, billed like a service.
                name: "Break the Wire at Verdigris Ridge",
                client: "Reichsinfernokorps Liaison Office",
                description: "Management requires a demonstration of resolve along the ridge line, chiefly so the Liaison Office can report progress to Berlin without further specifics. Resolve is billed hourly and the meter is already running.",
                paymentClause: "{payout} on demonstrated resolve, paid in cash, per the Office's usual arrangement: no paperwork.",
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
            },
            {
                // Repossession: the asset is worth money and the client wants it back.
                name: "Repossess the Furnace Row Machinery",
                client: "Brimstone Barons Equipment Leasing Consortium",
                description: "The Stoker's Union has occupied Company property and, worse from the Consortium's view, stopped making the lease payments on it. The property is on fire, but it is still leased property, and leased property gets repossessed.",
                paymentClause: "{payout} on recovery of the machinery, less depreciation, per lease-recovery schedule 1.",
            },
            {
                // Insurance mitigation: strikebreakers as a covered service.
                name: "Escort the Strikebreakers",
                client: "Dis Foundry Belt Board of Overseers",
                description: "The replacement crews are contracted, paid, and refusing to walk to the furnace floor unescorted, which is a labor cost the Board is accruing whether or not any labor occurs. Deliver them intact and the meter stops.",
                paymentClause: "{payout} on the crews reaching shift, invoiced against the Board's production contingency.",
            },
            {
                // Insurance mitigation: audit the source of claims before they're paid out.
                name: "Audit the Molten Agitators",
                client: "Continental Casualty & Ossuary Underwriters",
                description: "A rash of furnace-floor 'accidents' has produced more claims than the Union's own casualty numbers can explain. Our client suspects sabotage rather than misfortune, and sabotage is a category they don't have to pay out on if it can be proven.",
                paymentClause: "{payout} on a certified finding, per indemnity schedule 11, fraud investigation rider.",
            },
            {
                // Repossession: the office itself, and the paperwork inside it, are the asset.
                name: "Reclaim the Overseer's Office",
                client: "Brimstone Barons Equipment Leasing Consortium",
                description: "The Union has occupied the Overseer's office along with the machinery, and the office safe holds the original lease documents the Consortium needs to enforce the repossession in the first place. No documents, no claim.",
                paymentClause: "{payout} on recovery of the office and its contents, per lease-recovery schedule 1.",
            },
            {
                // Political subsidy: discretion is what's being purchased.
                name: "Satisfy the Brimstone Barons' Discretion",
                client: "The Brimstone Barons, jointly",
                description: "The Barons require a certain matter along Furnace Row resolved without their names appearing in the Board's minutes. The matter itself is unremarkable; the discretion is what costs money.",
                paymentClause: "{payout} on resolution, paid in cash, no minute taken.",
            },
        ],
    },
];

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

    private pick<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Highest act available. Deeper regions unlock by calendar year OR by
     * proven competence (contracts completed), whichever comes first — a
     * fast-playing company sees variety sooner instead of grinding the
     * Styx Delta for two full years.
     */
    private maxActUnlocked(year: number, contractsCompleted: number): number {
        if (year >= 6 || contractsCompleted >= 20) return 3;
        if (year >= 3 || contractsCompleted >= 8) return 2;
        return 1;
    }

    public generateContract(year: number, contractsCompleted: number = 0): Contract {
        const maxAct = this.maxActUnlocked(year, contractsCompleted);
        const eligibleRegions = REGION_FLAVORS.filter(r => r.act <= maxAct);
        const region = this.pick(eligibleRegions);
        const template = this.pick(region.templates);

        // Segment within the act is the fine-grained difficulty dial.
        const segment = Math.floor(Math.random() * 3);
        const difficultyStars = segment + 1;

        const numCombats = Math.random() < 0.45 ? 1 : 2;
        // Deeper acts and segments pay more; two-combat sorties pay almost double.
        const basePay = 30 + region.act * 20 + segment * 25;
        const jitter = 0.85 + Math.random() * 0.3;
        const jitteredPayout = Math.round((basePay * numCombats * jitter) / 5) * 5;
        // Standing Orders (e.g. Hazard Pay Schedule) apply AFTER the jitter and
        // re-round to £5, so the final payout is always a clean invoice figure.
        const payout = Math.round(StandingOrdersState.getInstance().contractPayout(jitteredPayout) / 5) * 5;
        const deadlineWeeks = StandingOrdersState.getInstance()
            .contractDeadlineWeeks(2 + Math.floor(Math.random() * 3)); // 2-4 weeks on the board, base

        const consumableRewardName = Math.random() < ContractGenerator.CONSUMABLE_REWARD_CHANCE
            ? this.pick([...CONSUMABLE_REWARD_NAMES])
            : undefined;

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
            regionName: region.regionName,
            consumableRewardName,
        });
    }

    /** Top the board back up to targetCount contracts (adjusted by Standing Orders). */
    public refillBoard(existing: Contract[], year: number, contractsCompleted: number = 0, targetCount: number = 5): Contract[] {
        const board = [...existing];
        const adjustedTarget = StandingOrdersState.getInstance().contractBoardTarget(targetCount);
        while (board.length < adjustedTarget) {
            board.push(this.generateContract(year, contractsCompleted));
        }
        return board;
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
