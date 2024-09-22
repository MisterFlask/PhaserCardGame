import { AbstractIntent, AttackIntent } from "../AbstractIntent";
import { AutomatedCharacter } from "../AutomatedCharacter";
import { Strong } from "../buffs/Strong";

export class GoblinCharacter extends AutomatedCharacter {
    constructor() {
        super({ name: "Goblin", portraitName: "placeholder", maxHitpoints: 10, description: "A small, mischievous creature" })
        this.buffs.push(new Strong(2))
    }
    override generateNewIntents(): AbstractIntent[] {
        return [new AttackIntent({ owner: this, damage: 1  })];
    }
}