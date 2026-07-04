import { Contract, ContractType } from "./Contract";

interface RegionFlavor {
    regionName: string;
    act: number;
    bountyNames: string[];
    descriptions: string[];
}

const REGION_FLAVORS: RegionFlavor[] = [
    {
        regionName: "Styx Delta",
        act: 1,
        bountyNames: [
            "Clear the Fare-Dodgers' Shoal",
            "Suppress the Boatmen's Picket",
            "Cull the Telegraph Eels",
            "Evict the Marsh Brigands",
            "Punitive Action: Skeeterwisp Bloom",
            "Secure the Dam Survey Party's Retreat",
        ],
        descriptions: [
            "The Styx Dam Project office reports interference with lawful commerce. Resolve it.",
            "Guild ferrymen have declared certain channels 'closed for mourning'. The Company does not recognize mourning.",
            "Something in the reeds has been eating the mail. The mail is insured; the couriers are not.",
        ],
    },
    {
        regionName: "Deep France",
        act: 2,
        bountyNames: [
            "Silence the Mitrailleuse Choir",
            "Break the Old Guard Picquet",
            "Burn the Trench Ossuary",
            "Intercept the Spectral Auditors",
            "Raid the Restauranteur's Larder",
        ],
        descriptions: [
            "The Emperor Undying's men have entrenched across our concession. Un-entrench them.",
            "Reichsinfernokorps liaison requests deniable assistance. Payment is not deniable.",
            "The trenches produce nothing but casualties and paperwork. Reduce at least one of these.",
        ],
    },
    {
        regionName: "Dis Foundry Belt",
        act: 3,
        bountyNames: [
            "Suppress the Wildcat Strike",
            "Repossess the Furnace Row Machinery",
            "Escort the Strikebreakers",
            "Audit the Molten Agitators",
            "Reclaim the Overseer's Office",
        ],
        descriptions: [
            "The Stoker's Union has occupied Company property. The property is on fire, but it is our fire.",
            "Management requires a demonstration of resolve. Resolve is billed hourly.",
            "The Brimstone Barons request discretion. The Barons pay extra for discretion.",
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

    private pick<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Highest act available given the campaign year (year 1-10).
     * Years 1-2: act 1 only. Years 3-5: acts 1-2. Year 6+: all acts.
     */
    private maxActForYear(year: number): number {
        if (year <= 2) return 1;
        if (year <= 5) return 2;
        return 3;
    }

    public generateContract(year: number): Contract {
        const maxAct = this.maxActForYear(year);
        const eligibleRegions = REGION_FLAVORS.filter(r => r.act <= maxAct);
        const region = this.pick(eligibleRegions);

        // Segment within the act is the fine-grained difficulty dial.
        const segment = Math.floor(Math.random() * 3);
        const difficultyStars = segment + 1;

        const numCombats = Math.random() < 0.45 ? 1 : 2;
        // Deeper acts and segments pay more; two-combat sorties pay almost double.
        const basePay = 30 + region.act * 20 + segment * 25;
        const jitter = 0.85 + Math.random() * 0.3;
        const payout = Math.round((basePay * numCombats * jitter) / 5) * 5;

        return new Contract({
            name: this.pick(region.bountyNames),
            description: this.pick(region.descriptions),
            type: ContractType.BOUNTY,
            act: region.act,
            segment,
            difficultyStars,
            numCombats,
            deadlineWeeks: 2 + Math.floor(Math.random() * 3), // 2-4 weeks on the board
            durationWeeks: numCombats,                        // sortie consumes 1-2 weeks
            payout,
            regionName: region.regionName,
        });
    }

    /** Top the board back up to targetCount contracts. */
    public refillBoard(existing: Contract[], year: number, targetCount: number = 5): Contract[] {
        const board = [...existing];
        while (board.length < targetCount) {
            board.push(this.generateContract(year));
        }
        return board;
    }
}
