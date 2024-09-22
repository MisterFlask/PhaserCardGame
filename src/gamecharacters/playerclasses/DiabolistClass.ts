import ImageUtils from "../../utils/ImageUtils";
import { Gender } from "../BaseCharacter";
import { BaseCharacterClass } from "../CharacterClasses";
import { ArcaneRitualCard, SummonDemonCard } from "./DiabolistCards";

export class DiabolistClass extends BaseCharacterClass {
    getPortraitNameAtRandom(gender: Gender): string {
        return ImageUtils.getRandomImageNameFromCategory(`portraits_diabolist_${gender === Gender.Female ? "female" : "male"}` as "portraits_diabolist_female");
    }
    constructor() {
        super({ name: "Diabolist", iconName: "diabolist_icon", startingMaxHp: 20 })
        // Add Diabolist-specific cards here
        this.addCard(new ArcaneRitualCard())
        this.addCard(new SummonDemonCard())
    }
}