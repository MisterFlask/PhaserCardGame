import { AbstractIntent, AttackIntent } from '../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../gamecharacters/AutomatedCharacter';
import { Strong } from '../gamecharacters/buffs/Strong';
import { GoblinCharacter } from '../gamecharacters/enemyclasses/GoblinCharacter';

// Define new character classes
export class ClockworkAbomination extends AutomatedCharacter {
    constructor() {
        super({ name: 'Clockwork Abomination', portraitName: 'Clockwork Abomination', maxHitpoints: 30, description: 'A fierce orc warrior' });
    }
    
    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ damage: 5, owner: this }) ]
    }
}

export class BaconBeast extends AutomatedCharacter {
    constructor() {
        super({ name: 'Breakfast Nightmares Bacon Beast', portraitName: 'Breakfast Nightmares Bacon Beast', maxHitpoints: 25, description: 'A cunning dark elf assassin' });
        this.buffs.push(new Strong(2))

    }
    
    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ damage: 6, owner: this }) ]
    }
}

export class BloodManipulationSlime extends AutomatedCharacter {
    constructor() {
        super({ name: 'Blood Manipulation Slime', portraitName: 'Blood Manipulation Slime', maxHitpoints: 20, description: 'A reanimated skeleton warrior' });
        this.buffs.push(new Strong(3))

    }
    
    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ damage: 10, owner: this }) ]
    }
}

export interface EncounterData {
    enemies: AutomatedCharacter[];
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

    private constructor() {
        
    }

    public static getInstance(): EncounterManager {
        if (!EncounterManager.instance) {
            EncounterManager.instance = new EncounterManager();
        }
        return EncounterManager.instance;
    }

    public getRandomEncounter(): EncounterData {

        const encounters = [
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
        const randomIndex = Math.floor(Math.random() * encounters.length);
        return encounters[randomIndex].data;
    }
}
