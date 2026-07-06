import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { AbyssalResearchInstitute } from "./AbyssalResearchInstitute";
import { BlueRoomReadingSocieties } from "./BlueRoomReadingSocieties";
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
    new RetrainingProgram()
];

/**
 * Purchasable pool: ALL_STRATEGIC_PROJECTS minus the five cargo/trade-route
 * projects pulled from the pool by the Standing Orders amendment (July 2026,
 * see src/docs/strategic_layer_redesign.md). ALL_STRATEGIC_PROJECTS itself
 * stays intact so the save loader can still match against every instance
 * that might appear in an existing save's ownedProjects list.
 */
const DEAD_CARGO_PROJECT_NAMES = new Set([
    new SmytheBowyerPoppyFields().name,
    new BlueRoomReadingSocieties().name,
    new RevolutionaryContacts().name,
    new PhlegethonCoalfalls().name,
    new LeviMaxwellAscensionProtocol().name,
]);

export const PURCHASABLE_STRATEGIC_PROJECTS: AbstractStrategicProject[] =
    ALL_STRATEGIC_PROJECTS.filter(p => !DEAD_CARGO_PROJECT_NAMES.has(p.name));
