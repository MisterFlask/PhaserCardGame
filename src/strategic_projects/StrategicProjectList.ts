import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { AbyssalResearchInstitute } from "./AbyssalResearchInstitute";
import { BlueRoomReadingSocieties } from "./BlueRoomReadingSocieties";
import { DisMunicipalBonds } from "./DisMunicipalBonds";
import { LetheExtractionCo } from "./LetheExtractionCo";
import { LeviMaxwellAscensionProtocol } from "./LeviMaxwellAscensionProtocol";
import { OurManInDis } from "./OurManInDis";
import { PhlegethonCoalfalls } from "./PhlegethonCoalfalls";
import { RevolutionaryContacts } from "./RevolutionaryContacts";
import { SmytheBowyerPoppyFields } from "./SmytheBowyerPoppyFields";

export const ALL_STRATEGIC_PROJECTS: AbstractStrategicProject[] = [
    new AbyssalResearchInstitute(),
    new LeviMaxwellAscensionProtocol(),
    new OurManInDis(),
    new LetheExtractionCo(),
    new DisMunicipalBonds(),
    new SmytheBowyerPoppyFields(),
    new BlueRoomReadingSocieties(),
    new RevolutionaryContacts(),
    new PhlegethonCoalfalls()
];
