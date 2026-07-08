import ImageUtils from "../../utils/ImageUtils";
import { Gender } from "../BaseCharacter";
import { BaseCharacterClass } from "../BaseCharacterClass";
import { CharacterClasses } from "../CharacterClasses";

// Import commons
import { AssemblyLine } from "./cards/cog/commons/AssemblyLine";
import { GenerateCharge } from "./cards/cog/commons/Charge";
import { PneumaticBarrier } from "./cards/cog/commons/PneumaticBarrier";
import { ReplicateArmaments } from "./cards/cog/commons/ReplicateArmaments";
import { ScrapShield } from "./cards/cog/commons/ScrapShield";
import { SelfUpgradingRevolver } from "./cards/cog/commons/SelfUpgradingRevolver";
import { StampPress } from "./cards/cog/commons/StampPress";

// Import uncommons
import { ForgeBlast } from "./cards/cog/uncommons/ForgeBlast";
import { PatentInfringement } from "./cards/cog/uncommons/PatentInfringement";
import { Phlogistonist } from "./cards/cog/uncommons/Phlogistonist";
import { PneumaticAxe } from "./cards/cog/uncommons/PneumaticAxe";
import { PneumaticRevolver } from "./cards/cog/uncommons/PneumaticRevolver";
import { PowerCore } from "./cards/cog/uncommons/PowerCore";
import { WarrantyClause } from "./cards/cog/uncommons/WarrantyClause";

// Import rares
import { DepreciationSchedule } from "./cards/cog/rares/DepreciationSchedule";
import { ForceShield } from "./cards/cog/rares/ForceShield";
import { GaussRifle } from "./cards/cog/rares/GaussRifle";
import { MasterEngineer } from "./cards/cog/rares/MasterEngineer";
import { MidnightOil } from "./cards/cog/rares/MidnightOil";
import { ProductionQuota } from "./cards/cog/rares/ProductionQuota";
import { RevolverExpert } from "./cards/cog/rares/RevolverExpert";

export class CogClass extends BaseCharacterClass {
    getPortraitNameAtRandom(gender: Gender): string {
        return ImageUtils.getRandomImageNameFromCategory(`portraits_cog_${gender === Gender.Female ? "female" : "male"}` as any);
    }

    constructor() {
        super({ name: "Cog", id: CharacterClasses.COG_ID, iconName: "cog_icon", startingMaxHp: 25 })
        this.cardBackgroundImageName = "cog_background"
        this.longDescription = "The Cog is not employed by the Company; the Cog is inventoried by it. Assembled under Clockwork Wastes patents and leased to expeditions at a per-quarter rate the Ledger books under Plant & Equipment, a Cog arrives crated, self-assembles, and requisitions its own ammunition by stamping it from scrap on the march."
        this.availableCards = [
            // commons
            new AssemblyLine(),
            new GenerateCharge(),
            new PneumaticBarrier(),
            new ReplicateArmaments(),
            new ScrapShield(),
            new SelfUpgradingRevolver(),
            new StampPress(),

            // uncommons
            new ForgeBlast(),
            new PatentInfringement(),
            new Phlogistonist(),
            new PneumaticAxe(),
            new PneumaticRevolver(),
            new PowerCore(),
            new WarrantyClause(),

            // rares
            new DepreciationSchedule(),
            new ForceShield(),
            new GaussRifle(),
            new MasterEngineer(),
            new MidnightOil(),
            new ProductionQuota(),
            new RevolverExpert()
        ]
    }
}