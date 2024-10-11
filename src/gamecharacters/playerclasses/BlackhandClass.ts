import ImageUtils from "../../utils/ImageUtils";
import { Gender } from "../BaseCharacter";
import { BaseCharacterClass } from "../CharacterClasses";
import { Rummage } from "./cards/basic/Rummage";
import { AndThenHeExploded } from "./cards/blackhand/AndThenHeExploded";
import { FireAxe } from "./cards/blackhand/commons/FireAxe";
import { FlamePistol } from "./cards/blackhand/commons/FlamePistol";
import { FiredUp } from "./cards/blackhand/FiredUp";
import { HazmatSpecialist } from "./cards/blackhand/HazmatSpecialist";
import { PocketVial } from "./cards/blackhand/PocketVial";
import { Pyrestarter } from "./cards/blackhand/Pyrestarter";
import { RageFueledAxe } from "./cards/blackhand/RageFueledAxe";
import { ReIgnition } from "./cards/blackhand/ReIgnition";
import { Smokescreen } from "./cards/blackhand/Smokescreen";
import { StormCloak } from "./cards/blackhand/StormCloak";
import { ToxicSpill } from "./cards/blackhand/ToxicSpill";

export class BlackhandClass extends BaseCharacterClass {
    getPortraitNameAtRandom(gender: Gender): string {
        return ImageUtils.getRandomImageNameFromCategory(`portraits_blackhand_${gender === Gender.Female ? "female" : "male"}` as "portraits_blackhand_female");
    }
    constructor() {
        super({ name: "Blackhand", iconName: "blackhand_icon", startingMaxHp: 30 })
        // Add Blackhand-specific cards here
        this.addCard(new FireAxe())
        this.addCard(new FlamePistol())
        this.addCard(new StormCloak())
        this.addCard(new FiredUp())
        this.addCard(new Rummage())
        this.addCard(new AndThenHeExploded())
        this.addCard(new FiredUp())
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