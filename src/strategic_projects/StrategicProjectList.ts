import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { AbyssalResearchInstitute } from "./AbyssalResearchInstitute";
import { BlueRoomReadingSocieties } from "./BlueRoomReadingSocieties";
import { CompanySecretariat } from "./CompanySecretariat";
import { DisMunicipalBonds } from "./DisMunicipalBonds";
import { LetheExtractionCo } from "./LetheExtractionCo";
import { LeviMaxwellAscensionProtocol } from "./LeviMaxwellAscensionProtocol";
import { OurManInDis } from "./OurManInDis";
import { PhlegethonCoalfalls } from "./PhlegethonCoalfalls";
import { RetrainingProgram } from "./RetrainingProgram";
import { RevolutionaryContacts } from "./RevolutionaryContacts";
import { SmytheBowyerPoppyFields } from "./SmytheBowyerPoppyFields";
import { TheFoundry } from "./TheFoundry";

export const ALL_STRATEGIC_PROJECTS: AbstractStrategicProject[] = [
    new AbyssalResearchInstitute(),
    new LeviMaxwellAscensionProtocol(),
    new OurManInDis(),
    new LetheExtractionCo(),
    new DisMunicipalBonds(),
    new SmytheBowyerPoppyFields(),
    new BlueRoomReadingSocieties(),
    new RevolutionaryContacts(),
    new PhlegethonCoalfalls(),
    new TheFoundry(),
    new RetrainingProgram(),
    new CompanySecretariat(),
];

/**
 * Purchasable pool: ALL_STRATEGIC_PROJECTS minus (a) the four cargo/trade-route
 * projects pulled from the pool by the Standing Orders amendment (July 2026)
 * and (b) Abyssal Research Institute, converted from a Capital Work to a
 * Standing Order by the same amendment (see src/docs/strategic_layer_redesign.md
 * and src/campaign/orders/LaunchOrders.ts's AbyssalResearchInstituteOrder).
 * ALL_STRATEGIC_PROJECTS itself stays intact so the save loader can still
 * match against every instance that might appear in an existing save's
 * ownedProjects list (see CampaignSerializer.applySave's ARI migration).
 *
 * Levi-Maxwell Ascension Protocol was ALSO on this dead list (the retrofit
 * table's "pulled from pool; parked for v2 VP capstone") but has since been
 * repurposed into the staged VP capstone (src/docs/vp_endgame_design.md) and
 * is back in the pool, gated by year instead — see
 * isYearGatedProjectAvailable below.
 */
const DEAD_CARGO_PROJECT_NAMES = new Set([
    new SmytheBowyerPoppyFields().name,
    new BlueRoomReadingSocieties().name,
    new RevolutionaryContacts().name,
    new PhlegethonCoalfalls().name,
]);

/** Name string used both to find a legacy owned copy (migration) and to
 *  exclude it from the purchasable pool. Kept as a named export so the
 *  serializer's migration logic and this pool filter can never drift apart
 *  (house rule 6: registries over duplicated special-case strings). */
export const ABYSSAL_RESEARCH_INSTITUTE_LEGACY_PROJECT_NAME = new AbyssalResearchInstitute().name;

export const PURCHASABLE_STRATEGIC_PROJECTS: AbstractStrategicProject[] =
    ALL_STRATEGIC_PROJECTS.filter(p =>
        !DEAD_CARGO_PROJECT_NAMES.has(p.name) && p.name !== ABYSSAL_RESEARCH_INSTITUTE_LEGACY_PROJECT_NAME);

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
