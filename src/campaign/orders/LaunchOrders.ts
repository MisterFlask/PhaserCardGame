// The launch pool of 9 Standing Orders (see strategic_layer_redesign.md,
// "Amendment: Standing Orders" -> "Launch order sketch"). Each class owns its
// own hook overrides; no if-this-order-id branching lives outside this file
// (house rule 6). Rounding conventions follow ContractGenerator (nearest £5).

import { StandingOrder } from "./StandingOrder";

function roundToFive(n: number): number {
    return Math.round(n / 5) * 5;
}

export class AggressiveTendering extends StandingOrder {
    public readonly id = "aggressive-tendering";
    public readonly name = "Aggressive Tendering";
    public readonly description = "The board instructs the clerks to solicit a wider slate of bids. The contract board refills to [b]6[/b] postings instead of 5.";
    public readonly flavor = "Memo: \"More paper on the board means more paper in the vault.\" — Procurement";

    public modifyContractBoardTarget(n: number): number { return n + 1; }
}

export class PunctualityClause extends StandingOrder {
    public readonly id = "punctuality-clause";
    public readonly name = "Punctuality Clause";
    public readonly description = "Standard contract terms are renegotiated to add [b]1 week[/b] to every deadline, on the theory that a client who waits an extra week is still a client.";
    public readonly flavor = "Clause 14(b), amended: \"Time is of the essence, but not urgently so.\"";

    public modifyContractDeadlineWeeks(w: number): number { return w + 1; }
}

export class HazardPaySchedule extends StandingOrder {
    public readonly id = "hazard-pay-schedule";
    public readonly name = "Hazard Pay Schedule";
    public readonly description = "Contract payouts rise [b]20%[/b] to reflect the genuine hazards of the work, and the Company's physicians correspondingly take [b]1 additional week[/b] to sign off on a wound as healed. Risk, properly priced, cuts both ways.";
    public readonly flavor = "Actuarial note: \"Danger money is still money. It is also, notably, danger.\"";

    public modifyContractPayout(p: number): number { return roundToFive(p * 1.2); }
    public modifyWoundWeeks(w: number): number { return w + 1; }
}

export class RecruitingSergeants extends StandingOrder {
    public readonly id = "recruiting-sergeants";
    public readonly name = "Recruiting Sergeants";
    public readonly description = "Recruiting sergeants are dispatched to the public houses on a commission basis, cutting the Company's hiring cost by [b]40%[/b].";
    public readonly flavor = "Ledger entry: \"Ale is cheaper than advertising, and considerably more persuasive.\"";

    public modifyRecruitCost(c: number): number { return roundToFive(c * 0.6); }
}

export class PhrenologyRetainer extends StandingOrder {
    public readonly id = "phrenology-retainer";
    public readonly name = "Accredited Phrenology Retainer";
    public readonly description = "An accredited phrenologist is retained on standing contract, halving the cost of stress treatment for the roster. Science, billed hourly.";
    public readonly flavor = "Letterhead: \"The bumps on a man's skull are free to read; the reading is not.\"";

    public modifyTherapyCost(c: number): number { return roundToFive(c * 0.5); }
}

export class InvestorRelationsRetainer extends StandingOrder {
    public readonly id = "investor-relations-retainer";
    public readonly name = "Investor Relations Retainer";
    public readonly description = "A retained Investor Relations man keeps the shareholders' expectations pleasantly vague, dampening the yearly dividend escalation by [b]25%[/b].";
    public readonly flavor = "Prospectus: \"Growth, yes, but gentle growth. Nobody likes a startled shareholder.\"";

    public modifyDividendEscalationRate(rate: number): number {
        return 1 + (rate - 1) * 0.75;
    }
}

export class BarristersOnRetainer extends StandingOrder {
    public readonly id = "barristers-on-retainer";
    public readonly name = "Barristers on Retainer";
    public readonly description = "Barristers on permanent retainer soften the shareholders' reaction to a short dividend, reducing the satisfaction penalty by [b]25%[/b].";
    public readonly flavor = "Invoice: \"For services rendered: making bad news sound like sound governance.\"";

    public modifySatisfactionHit(hit: number): number { return Math.round(hit * 0.75); }
}

export class ArchivesStandingOrder extends StandingOrder {
    public readonly id = "archives-standing-order";
    public readonly name = "Archives Standing Order";
    public readonly description = "The Company Archives cross-reference every completed sortie against precedent, turning up [b]one additional card option[/b] (4 instead of 3) after combat.";
    public readonly flavor = "Filing note: \"Precedent is just plagiarism with a citation.\" — The Archives";

    public modifyCardRewardChoices(n: number): number { return n + 1; }
}

export class IncendiaryDoctrine extends StandingOrder {
    public readonly id = "incendiary-doctrine";
    public readonly name = "Incendiary Doctrine";
    public readonly description = "Field manuals are reissued with a chapter on thorough combustion. Whenever a member of your squad applies [b]Burning[/b] to an enemy, apply [b]1 additional stack[/b].";
    public readonly flavor = "Field manual, addendum: \"If the client is not sufficiently alight, the application was insufficient.\" — Ordnance Directorate";

    public modifyStatusApplicationStacks(buffId: string, stacks: number, sourceIsAlly: boolean, targetIsAlly: boolean): number {
        if (buffId === "Burning" && sourceIsAlly && !targetIsAlly) {
            return stacks + 1;
        }
        return stacks;
    }
}

/** Stable id, exported so CampaignSerializer's legacy-project migration
 *  (a save with ARI still owned as a Capital Work) can reference it without
 *  a magic string. */
export const ABYSSAL_RESEARCH_INSTITUTE_ORDER_ID = "abyssal-research-institute";

export class AbyssalResearchInstituteOrder extends StandingOrder {
    public readonly id = ABYSSAL_RESEARCH_INSTITUTE_ORDER_ID;
    public readonly name = "Abyssal Research Institute";
    public readonly description = "A standing research grant to the Institute at the edge of the Abyssal Frontier converts its findings into field experience: every combat win banks [b]25% additional XP[/b] for the squad.";
    public readonly flavor = "Research memo: \"We do not yet understand what we found. We do, however, bill for it.\"";

    public modifyXpGain(xp: number): number { return Math.round(xp * 1.25); }
}

/** Launch pool, in a stable order. Add new orders here, never by id-branch. */
export const LAUNCH_ORDERS: StandingOrder[] = [
    new AggressiveTendering(),
    new PunctualityClause(),
    new HazardPaySchedule(),
    new RecruitingSergeants(),
    new PhrenologyRetainer(),
    new InvestorRelationsRetainer(),
    new BarristersOnRetainer(),
    new ArchivesStandingOrder(),
    new IncendiaryDoctrine(),
    new AbyssalResearchInstituteOrder(),
];
