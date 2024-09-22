import ImageUtils from "../../utils/ImageUtils";
import { Gender } from "../BaseCharacter";
import { BaseCharacterClass } from "../CharacterClasses";
import { FireAxe } from "./cards/blackhand/FireAxe";
import { FiredUp } from "./cards/blackhand/FiredUp";
import { FlamePistol } from "./cards/blackhand/FlamePistol";
import { StormCloak } from "./cards/blackhand/StormCloak";

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
    }
}