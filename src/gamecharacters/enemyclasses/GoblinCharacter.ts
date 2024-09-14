import { AbstractIntent, AttackIntent } from "../AbstractIntent";
import { AutomatedCharacter } from "../AutomatedCharacter";

export class GoblinCharacter extends AutomatedCharacter {
    constructor() {
        super({ name: "Goblin", portraitName: "flamer1", maxHitpoints: 10, description: "A small, mischievous creature" })
    }
    override generateNewIntents(): AbstractIntent[] {
        return [new AttackIntent({ owner: this, damage: 1  })];
    }
}