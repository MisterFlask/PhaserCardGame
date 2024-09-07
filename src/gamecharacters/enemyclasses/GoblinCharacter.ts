import { EnemyCharacter } from "../CharacterClasses";

export class GoblinCharacter extends EnemyCharacter {
    constructor() {
        super({ name: "Goblin", portraitName: "flamer1", maxHitpoints: 10, description: "A small, mischievous creature" })
    }
}