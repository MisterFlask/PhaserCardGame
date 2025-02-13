import ImageUtils from "../../utils/ImageUtils";
import { Gender } from "../BaseCharacter";
import { BaseCharacterClass } from "../BaseCharacterClass";
import { CharacterClasses } from "../CharacterClasses";

// Import commons
import { Charge } from "./cards/cog/commons/Charge";
import { PneumaticBarrier } from "./cards/cog/commons/PneumaticBarrier";
import { ReplicateArmaments } from "./cards/cog/commons/ReplicateArmaments";
import { ScrapShield } from "./cards/cog/commons/ScrapShield";
import { SelfUpgradingRevolver } from "./cards/cog/commons/SelfUpgradingRevolver";

// Import uncommons
import { ForgeBlast } from "./cards/cog/uncommons/ForgeBlast";
import { Phlogistonist } from "./cards/cog/uncommons/Phlogistonist";
import { PneumaticAxe } from "./cards/cog/uncommons/PneumaticAxe";
import { PneumaticRevolver } from "./cards/cog/uncommons/PneumaticRevolver";
import { PowerCore } from "./cards/cog/uncommons/PowerCore";

// Import rares
import { ForceShield } from "./cards/cog/rares/ForceShield";
import { GaussRifle } from "./cards/cog/rares/GaussRifle";
import { MasterEngineer } from "./cards/cog/rares/MasterEngineer";
import { MidnightOil } from "./cards/cog/rares/MidnightOil";
import { RevolverExpert } from "./cards/cog/rares/RevolverExpert";

export class CogClass extends BaseCharacterClass {
    getPortraitNameAtRandom(gender: Gender): string {
        return ImageUtils.getRandomImageNameFromCategory(`portraits_cog_${gender === Gender.Female ? "female" : "male"}` as any);
    }

    constructor() {
        super({ name: "Cog", id: CharacterClasses.COG_ID, iconName: "cog_icon", startingMaxHp: 25 })
        this.cardBackgroundImageName = "cog_background"
        this.longDescription = "INSERT DESCRIPTION HERE"
        this.availableCards = [
            // commons
            new Charge(),
            new PneumaticBarrier(),
            new ReplicateArmaments(),
            new ScrapShield(),
            new SelfUpgradingRevolver(),
            
            // uncommons
            new ForgeBlast(),
            new Phlogistonist(),
            new PneumaticAxe(),
            new PneumaticRevolver(),
            new PowerCore(),

            // rares
            new ForceShield(),
            new GaussRifle(),
            new MasterEngineer(),
            new MidnightOil(),
            new RevolverExpert()
        ]
    }
}