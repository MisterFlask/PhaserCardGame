import { BaseCharacterClass } from "./CharacterClasses";
import { FireballCard, ToxicCloudCard } from "./playerclasses/BlackhandCards";
import { ArcaneRitualCard, SummonDemonCard } from "./playerclasses/DiabolistCards";


export class BlackhandClass extends BaseCharacterClass {
    constructor() {
        super({ name: "Blackhand", iconName: "blackhand_icon", startingMaxHp: 30 })
        this.addCard(new FireballCard())
        this.addCard(new ToxicCloudCard())
    }
}

export class DiabolistClass extends BaseCharacterClass {
    constructor() {
        super({ name: "Diabolist", iconName: "diabolist_icon", startingMaxHp: 20 })
        this.addCard(new ArcaneRitualCard())
        this.addCard(new SummonDemonCard())
    }
}

