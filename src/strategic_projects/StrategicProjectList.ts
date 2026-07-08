import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { AbyssalResearchInstitute } from "./AbyssalResearchInstitute";
import { CantonmentAnnexe } from "./CantonmentAnnexe";
import { CompanySecretariat } from "./CompanySecretariat";
import { CorrectivePhrenologyWing } from "./CorrectivePhrenologyWing";
import { LeviMaxwellAscensionProtocol } from "./LeviMaxwellAscensionProtocol";
import { TheCompanyGazette } from "./TheCompanyGazette";
import { TheCompanyStore } from "./TheCompanyStore";
import { ThePatternRoom } from "./ThePatternRoom";

/**
 * Capital Works Rebuild (July 2026) — see src/docs/strategic_layer_redesign.md's
 * "Amendment: Capital Works Rebuild". Replaces the shipped Capital Works pool
 * wholesale: of the seven prior purchasable projects, most were flat in both
 * mechanics and flavor (near-duplicate income drips, a passive VP drip, bare
 * service unlocks, a bare slot purchase). This is Batch A of the rebuild —
 * the simple pool swap plus four new-mechanic projects (deck infra unlocks,
 * roster cap, per-soldier income, per-contract VP). The Foundry, Retraining
 * Program, Dis Municipal Bonds, Our Man In Dis, Lethe Extraction Co., and the
 * four dead cargo projects (Smythe-Bowyer Poppy Fields, Blue Room Reading
 * Societies, Revolutionary Contacts, Phlegethon Coalfalls) are deleted
 * outright — SAVE_FORMAT_VERSION bump discards old saves, so there is no
 * keep-for-save-matching reason to keep those classes around any longer.
 * The Abyssal Research Institute legacy class stays (serializer migration
 * path is unit-tested).
 */
export const ALL_STRATEGIC_PROJECTS: AbstractStrategicProject[] = [
    new LeviMaxwellAscensionProtocol(),
    new CompanySecretariat(),
    new ThePatternRoom(),
    new CorrectivePhrenologyWing(),
    new CantonmentAnnexe(),
    new TheCompanyStore(),
    new TheCompanyGazette(),
    new AbyssalResearchInstitute(),
];

/** Name string used both to find a legacy owned copy (migration) and to
 *  exclude it from the purchasable pool. Kept as a named export so the
 *  serializer's migration logic and this pool filter can never drift apart
 *  (house rule 6: registries over duplicated special-case strings). */
export const ABYSSAL_RESEARCH_INSTITUTE_LEGACY_PROJECT_NAME = new AbyssalResearchInstitute().name;

/**
 * Purchasable pool: ALL_STRATEGIC_PROJECTS minus Abyssal Research Institute,
 * converted from a Capital Work to a Standing Order by the Standing Orders
 * amendment (see src/docs/strategic_layer_redesign.md and
 * src/campaign/orders/LaunchOrders.ts's AbyssalResearchInstituteOrder).
 * ALL_STRATEGIC_PROJECTS itself stays intact so the save loader can still
 * match against every instance that might appear in an existing save's
 * ownedProjects list (see CampaignSerializer.applySave's ARI migration).
 */
export const PURCHASABLE_STRATEGIC_PROJECTS: AbstractStrategicProject[] =
    ALL_STRATEGIC_PROJECTS.filter(p => p.name !== ABYSSAL_RESEARCH_INSTITUTE_LEGACY_PROJECT_NAME);

/**
 * Campaign-year gate on project *purchasability* — there's no separate
 * "available pool" mechanism keyed by year (availableStrategicProjects is a
 * static list; see CampaignUiState.ts), so the Levi-Maxwell Ascension
 * Protocol brief's "only appears in the available pool from year 4+" is
 * implemented here instead, as a purchasability check the UI (InvestmentPanel/
 * PhysicalProjectCard) consults alongside funds and prerequisites. House
 * rule 6: a registry (this map), not an if-this-project branch, so future
 * year-gated Capital Works add one entry rather than new special-casing.
 */
export const PROJECT_MIN_PURCHASE_YEAR: ReadonlyMap<string, number> = new Map([
    [new LeviMaxwellAscensionProtocol().name, 4],
]);

/** True if `project` may be purchased in `year` per PROJECT_MIN_PURCHASE_YEAR
 *  (projects with no entry are ungated and always return true). */
export function isYearGatedProjectAvailable(project: AbstractStrategicProject, year: number): boolean {
    const minYear = PROJECT_MIN_PURCHASE_YEAR.get(project.name);
    return minYear === undefined || year >= minYear;
}
