import { AbstractIntent, AttackIntent } from "../AbstractIntent";
import { AutomatedCharacter } from "../AutomatedCharacter";
import { Lethality } from "../buffs/standard/Strong";

export class GoblinCharacter extends AutomatedCharacter {
    constructor() {
        super({ name: "Goblin", portraitName: "placeholder", maxHitpoints: 10, description: "A small, mischievous creature" })
        this.buffs.push(new Lethality(2))
    }
    override generateNewIntents(): AbstractIntent[] {
        return [new AttackIntent({ owner: this, baseDamage: 1  })];
    }
}