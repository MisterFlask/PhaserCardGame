import { AbstractIntent, AttackIntent } from "./AbstractIntent"
import { AutomatedCharacter } from "./AutomatedCharacter"
import { BaseCharacterClass } from "./CharacterClasses"
import { FireballCard, ToxicCloudCard } from "./playerclasses/BlackhandCards";
import { ArcaneRitualCard, SummonDemonCard } from "./playerclasses/DiabolistCards";

export class GoblinCharacter extends AutomatedCharacter {
    constructor() {
        super({ name: "Goblin", portraitName: "flamer1", maxHitpoints: 10, description: "A small, mischievous creature" })
    }
    generateNewIntents(): AbstractIntent[] {
        return [new AttackIntent({owner: this, damage: 1})];
    }
}

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

