import { BaseCharacterClass } from "../CharacterClasses";
import { ArcaneRitualCard, SummonDemonCard } from "./DiabolistCards";

export class DiabolistClass extends BaseCharacterClass {
    constructor() {
        super({ name: "Diabolist", iconName: "diabolist_icon", startingMaxHp: 20 })
        // Add Diabolist-specific cards here
        this.addCard(new ArcaneRitualCard())
        this.addCard(new SummonDemonCard())
    }
}