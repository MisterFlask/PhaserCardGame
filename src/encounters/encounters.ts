import { EnemyCharacter, GoblinCharacter } from '../gamecharacters/CharacterClasses';

// Define new character classes
export class ClockworkAbomination extends EnemyCharacter {
    constructor() {
        super({ name: 'Clockwork Abomination', portraitName: 'Clockwork Abomination', maxHitpoints: 30, description: 'A fierce orc warrior' });
    }
}

export class BaconBeast extends EnemyCharacter {
    constructor() {
        super({ name: 'Breakfast Nightmares Bacon Beast', portraitName: 'Breakfast Nightmares Bacon Beast', maxHitpoints: 25, description: 'A cunning dark elf assassin' });
    }
}

export class BloodManipulationSlime extends EnemyCharacter {
    constructor() {
        super({ name: 'Blood Manipulation Slime', portraitName: 'Blood Manipulation Slime', maxHitpoints: 20, description: 'A reanimated skeleton warrior' });
    }
}

export interface EncounterData {
    enemies: EnemyCharacter[];
    difficulty: string;
    rewardXP: number;
    specialConditions?: string[];
}

export class Encounter {
    data: EncounterData;

    constructor(data: EncounterData) {
        this.data = data;
    }
}

export class EncounterManager {
    private static instance: EncounterManager;
    private encounters: Encounter[];

    private constructor() {
        this.encounters = [
            new Encounter({
                enemies: [new GoblinCharacter(), new GoblinCharacter()],
                difficulty: 'Easy',
                rewardXP: 100
            }),
            new Encounter({
                enemies: [new ClockworkAbomination(), new GoblinCharacter()],
                difficulty: 'Medium',
                rewardXP: 150
            }),
            new Encounter({
                enemies: [new BaconBeast(), new BloodManipulationSlime()],
                difficulty: 'Hard',
                rewardXP: 200,
                specialConditions: ['Darkness']
            }),
            new Encounter({
                enemies: [new ClockworkAbomination(), new ClockworkAbomination()],
                difficulty: 'Hard',
                rewardXP: 250
            }),
            new Encounter({
                enemies: [new GoblinCharacter(), new GoblinCharacter(), new GoblinCharacter()],
                difficulty: 'Medium',
                rewardXP: 180
            }),
            new Encounter({
                enemies: [new BaconBeast(), new ClockworkAbomination(), new GoblinCharacter()],
                difficulty: 'Very Hard',
                rewardXP: 300,
                specialConditions: ['Ambush']
            }),
        ];
    }

    public static getInstance(): EncounterManager {
        if (!EncounterManager.instance) {
            EncounterManager.instance = new EncounterManager();
        }
        return EncounterManager.instance;
    }

    public getRandomEncounter(): EncounterData {
        const randomIndex = Math.floor(Math.random() * this.encounters.length);
        return this.encounters[randomIndex].data;
    }
}
