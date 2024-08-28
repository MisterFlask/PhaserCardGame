import { BaseCharacter, EnemyCharacter, GoblinCharacter } from '../gamecharacters/CharacterClasses';

// Define new character classes
class OrcWarrior extends EnemyCharacter {
    constructor() {
        super({ name: 'Orc Warrior', portraitName: 'orc_warrior', maxHitpoints: 30, description: 'A fierce orc warrior' });
    }
}

class DarkElf extends EnemyCharacter {
    constructor() {
        super({ name: 'Dark Elf', portraitName: 'dark_elf', maxHitpoints: 25, description: 'A cunning dark elf assassin' });
    }
}

class UndeadSkeleton extends EnemyCharacter {
    constructor() {
        super({ name: 'Undead Skeleton', portraitName: 'undead_skeleton', maxHitpoints: 20, description: 'A reanimated skeleton warrior' });
    }
}

export class Encounter {
    enemies: EnemyCharacter[];

    constructor(enemies: EnemyCharacter[]) {
        this.enemies = enemies;
    }
}

export class EncounterManager {
    private encounters: Encounter[];

    constructor() {
        this.encounters = [
            new Encounter([new GoblinCharacter(), new GoblinCharacter()]),
            new Encounter([new OrcWarrior(), new GoblinCharacter()]),
            new Encounter([new DarkElf(), new UndeadSkeleton()]),
            new Encounter([new OrcWarrior(), new OrcWarrior()]),
            new Encounter([new GoblinCharacter(), new GoblinCharacter(), new GoblinCharacter()]),
            new Encounter([new DarkElf(), new OrcWarrior(), new GoblinCharacter()]),
        ];
    }

    public getRandomEncounter(): EnemyCharacter[] {
        const randomIndex = Math.floor(Math.random() * this.encounters.length);
        return this.encounters[randomIndex].enemies;
    }
}
