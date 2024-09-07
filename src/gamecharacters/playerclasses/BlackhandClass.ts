import { BaseCharacterClass } from "../CharacterClasses";
import { FireballCard, ToxicCloudCard } from "./BlackhandCards";

export class BlackhandClass extends BaseCharacterClass {
    constructor() {
        super({ name: "Blackhand", iconName: "blackhand_icon", startingMaxHp: 30 })
        // Add Blackhand-specific cards here
        this.addCard(new FireballCard())
        this.addCard(new ToxicCloudCard())
    }
}