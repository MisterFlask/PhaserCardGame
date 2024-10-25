import ImageUtils from "../../utils/ImageUtils";
import { Gender } from "../BaseCharacter";
import { BaseCharacterClass } from "../CharacterClasses";
import { Rummage } from "./cards/basic/Rummage";
import { FireAxe } from "./cards/blackhand/commons/FireAxe";
import { FlamePistol } from "./cards/blackhand/commons/FlamePistol";
import { PocketVial } from "./cards/blackhand/commons/PocketVial";
import { RageFueledAxe } from "./cards/blackhand/commons/RageFueledAxe";
import { StormCloak } from "./cards/blackhand/commons/StormCloak";
import { InfernaliteCache } from "./cards/blackhand/rares/InfernaliteCache";
import { Pyrestarter } from "./cards/blackhand/rares/Pyrestarter";
import { ToxicSpill } from "./cards/blackhand/rares/ToxicSpill";
import { AndThenHeExploded } from "./cards/blackhand/uncommons/AndThenHeExploded";
import { HazmatSpecialist } from "./cards/blackhand/uncommons/HazmatSpecialist";
import { ReIgnition } from "./cards/blackhand/uncommons/ReIgnition";
import { Smokescreen } from "./cards/blackhand/uncommons/Smokescreen";

export class BlackhandClass extends BaseCharacterClass {
    getPortraitNameAtRandom(gender: Gender): string {
        return ImageUtils.getRandomImageNameFromCategory(`portraits_blackhand_${gender === Gender.Female ? "female" : "male"}` as "portraits_blackhand_female");
    }
    constructor() {
        super({ name: "Blackhand", iconName: "blackhand_icon", startingMaxHp: 30 })
        // Add Blackhand-specific cards here
        this.cardBackgroundImageName = "blackhand_background"

        this.addCard(new FireAxe())
        this.addCard(new FlamePistol())
        this.addCard(new StormCloak())
        this.addCard(new Rummage())
        this.addCard(new AndThenHeExploded())
        this.addCard(new InfernaliteCache())
        this.addCard(new FlamePistol())
        this.addCard(new HazmatSpecialist())
        this.addCard(new PocketVial())
        this.addCard(new Pyrestarter())
        this.addCard(new RageFueledAxe())
        this.addCard(new ReIgnition())
        this.addCard(new Smokescreen())
        this.addCard(new ToxicSpill())
    }
}