import { AbstractCard } from "../gamecharacters/AbstractCard";

import { Team } from "../gamecharacters/AbstractCard";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { CardType } from "../gamecharacters/Primitives";
import { WEEKS_PER_QUARTER, QUARTERS_PER_YEAR } from "../campaign/CampaignCalendar";
import { Contract } from "../campaign/Contract";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

/** One stage of a multi-stage ("staged") Capital Work — see
 *  src/docs/vp_endgame_design.md's deferred Levi-Maxwell Ascension Protocol
 *  capstone. Purely descriptive; cost/gating live on AbstractStrategicProject. */
export interface StrategicProjectStage {
    name: string;
    cost: number;
    description: string;
}

/** One campaign year, in weeks — the minimum gap enforced between staged
 *  Capital Work purchases (see AbstractStrategicProject.canPurchaseNextStage). */
export const WEEKS_PER_CAMPAIGN_YEAR = WEEKS_PER_QUARTER * QUARTERS_PER_YEAR;

export abstract class AbstractStrategicProject extends AbstractCard {

    public isOwned: boolean = false;

    /** Accumulated campaign score; tallied at charter expiry. */
    public victoryPoints: number = 0;

    public getVictoryPoints(): number {
        return this.victoryPoints;
    }

    /**
     * Optional multi-stage purchase ladder ("staged" Capital Work). Absent
     * (undefined) on every existing single-stage project — leave it unset
     * and every method below falls back to exactly today's single-purchase
     * behavior. Set it in a subclass constructor to opt into staging.
     */
    public stages?: StrategicProjectStage[];

    /** How many stages have been bought so far. Serialized (OwnedProjectDTO)
     *  only when isStaged() — meaningless/unused on single-stage projects. */
    public stagesPurchased: number = 0;

    /** Absolute campaign week the last stage was purchased on. Serialized
     *  alongside stagesPurchased; drives the one-campaign-year gate between
     *  stages. 0 before any stage has been bought. */
    public lastStagePurchaseWeek: number = 0;

    constructor({ name, description, portraitName }: { name: string; description: string; portraitName?: string }) {
        super({
            name,
            description,
            portraitName,
            cardType: CardType.SKILL,
            team: Team.ALLY
        });
    }

    public isStaged(): boolean {
        return this.stages !== undefined && this.stages.length > 0;
    }

    /** True once every stage has been purchased. Always false for a
     *  non-staged project (isOwned alone covers that case). */
    public isFullyStaged(): boolean {
        return this.isStaged() && this.stagesPurchased >= this.stages!.length;
    }

    /** The next unpurchased stage, or null if every stage is bought (or the
     *  project isn't staged at all). */
    public getNextStage(): StrategicProjectStage | null {
        if (!this.isStaged() || this.isFullyStaged()) return null;
        return this.stages![this.stagesPurchased];
    }

    public getMoneyCost(): number {
        const nextStage = this.getNextStage();
        if (nextStage) return nextStage.cost;
        return 100;
    }

    /**
     * Whether the next stage can be bought this week: false once every stage
     * is already purchased, and false until one full campaign year has
     * passed since the previous stage's purchase (no gate before stage 1,
     * since lastStagePurchaseWeek is 0 and any week 1+ clears it).
     */
    public canPurchaseNextStage(currentWeek: number): { ok: boolean; reason?: string } {
        if (!this.isStaged()) return { ok: true };
        if (this.isFullyStaged()) return { ok: false, reason: 'All stages complete.' };
        if (this.stagesPurchased === 0) return { ok: true };

        const availableWeek = this.lastStagePurchaseWeek + WEEKS_PER_CAMPAIGN_YEAR;
        if (currentWeek < availableWeek) {
            const availableYear = Math.floor((availableWeek - 1) / WEEKS_PER_CAMPAIGN_YEAR) + 1;
            return { ok: false, reason: `The board will not entertain the next stage before Year ${availableYear}.` };
        }
        return { ok: true };
    }

    /**
     * Records a stage purchase (increments stagesPurchased, stamps
     * lastStagePurchaseWeek). Callers (InvestmentPanel) must check
     * canPurchaseNextStage and deduct the vault cost themselves first — this
     * only advances the project's own state and fires the stage hook.
     */
    public purchaseNextStage(currentWeek: number): void {
        if (!this.isStaged() || this.isFullyStaged()) return;
        this.stagesPurchased += 1;
        this.lastStagePurchaseWeek = currentWeek;
        this.onStagePurchased(this.stagesPurchased);
    }

    public getPrerequisites(): AbstractStrategicProject[] {
        return [];
    }

    /**
     * Vestigial: no mechanical consumer ever read this (Capital Works are
     * purchased with £ alone — see InvestmentPanel), and no display path did
     * either (grepped clean across src/ before the Capital Works Rebuild,
     * July 2026 — see src/docs/strategic_layer_redesign.md's amendment).
     * Left as an overridable hook (rather than deleted outright) only
     * because LeviMaxwellAscensionProtocol, a kept pre-rebuild class, still
     * overrides it; StrategicResources.ts itself stays for that reason too.
     * New Batch-A projects must NOT override this.
     */
    public getStrategicResourceCost(): StrategicResource[] {
        return [];
    }

    public getAdditionalCargoOptions(): PlayableCard[] {
        return [];
    }

    /** Fires at each quarterly board meeting (was per-run before the contract
     *  pivot). ctx.rosterSize is the roster's size at that moment (Capital
     *  Works Rebuild, July 2026 — see The Company Store). */
    public onQuarterEnd(ctx: { rosterSize: number }): void {

    }

    /** Fires immediately after a staged project's Nth stage is bought
     *  (stageNumber is 1-based). No-op by default; override to grant a
     *  stage's effect (e.g. the final stage's VP payout). Never fires for
     *  non-staged projects (those use the ordinary owned/purchased flow). */
    public onStagePurchased(stageNumber: number): void {

    }

    /** Fires once per successfully completed contract sortie (SUCCESS path
     *  only — never on a squad wipe; see SortieManager.resolveSortie), for
     *  every currently-owned project. No-op by default; override to grant a
     *  per-contract effect (e.g. The Company Gazette's VP drip). */
    public onContractCompleted(contract: Contract): void {

    }
}
