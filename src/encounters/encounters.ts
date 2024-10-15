import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent } from '../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../gamecharacters/AutomatedCharacter';
import { Delicious } from '../gamecharacters/buffs/enemy_buffs/Delicious';
import { Stress } from '../gamecharacters/buffs/standard/Stress';
import { Stressful } from '../gamecharacters/buffs/standard/Stressful';
import { Strong } from '../gamecharacters/buffs/standard/Strong';
import { GoblinCharacter } from '../gamecharacters/enemyclasses/GoblinCharacter';

// Define new character classes
export class ClockworkAbomination extends AutomatedCharacter {
    constructor() {
        super({ name: 'Clockwork Abomination', portraitName: 'Clockwork Abomination', maxHitpoints: 30, description: 'A fierce orc warrior' });
    }
    
    override generateNewIntents(): AbstractIntent[] {
        return [ new ApplyDebuffToRandomCharacterIntent({ debuff: new Stress(5), owner: this }).withTitle("fascination") ]
    }
}

export class BaconBeast extends AutomatedCharacter {
    constructor() {
        super({ name: 'Breakfast Nightmares Bacon Beast', portraitName: 'Breakfast Nightmares Bacon Beast', maxHitpoints: 25, description: 'A cunning dark elf assassin' });
        this.buffs.push(new Strong(2))
        this.buffs.push(new Delicious(1));
        this.buffs.push(new Stressful(1));
    }
    

    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 6, owner: this }).withTitle("bite") ]
    }
}

export class BloodManipulationSlime extends AutomatedCharacter {
    constructor() {
        super({ name: 'Blood Manipulation Slime', portraitName: 'Blood Manipulation Slime', maxHitpoints: 20, description: 'A reanimated skeleton warrior' });
        this.buffs.push(new Strong(3))

    }
    
    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 10, owner: this }).withTitle("rapture") ]
    }
}

// basically two acts, boss fight in middle and end.  Sixteen combats in total.
export enum ActSegment{
    Act1_Segment1 = "Act 1 - Segment 1",
    Act1_Segment2 = "Act 1 - Segment 2",
    Boss_Act1 = "Boss Fight - Act 1",
    Act2_Segment1 = "Act 2 - Segment 1",
    Act2_Segment2 = "Act 2 - Segment 2",
    Boss_Act2 = "Boss Fight - Act 2",
    Special = "Special",
}


export interface EncounterData {
    enemies: AutomatedCharacter[];
    difficulty: ActSegment;
    rewardXP: number;
    specialConditions?: string[];
}

export class Encounter {
    data: EncounterData;
    peaceful: boolean = false;
    constructor(data: EncounterData) {
        this.data = data;
    }
}

export class ShopGuy extends AutomatedCharacter {
    constructor() {
        super({ name: 'Shop Guy', portraitName: 'ShopGuy', maxHitpoints: 10, description: 'this aint a charity' });
    }

    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 10, owner: this }).withTitle("rapture") ]
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

    public getShopEncounter(): Encounter {
        return new Encounter({
            enemies: [new ShopGuy()],
            difficulty: ActSegment.Special,
            rewardXP: 0
        });
    }   

    public getRandomEncounter(): EncounterData {
        const encounters = [
            new Encounter({
                enemies: [new GoblinCharacter(), new GoblinCharacter()],
                difficulty: ActSegment.Act1_Segment1,
                rewardXP: 100
            }),
            new Encounter({
                enemies: [new ClockworkAbomination(), new GoblinCharacter()],
                difficulty: ActSegment.Act1_Segment2,
                rewardXP: 150
            }),
            new Encounter({
                enemies: [new BaconBeast(), new BloodManipulationSlime()],
                difficulty: ActSegment.Boss_Act1,
                rewardXP: 200,
                specialConditions: ['Darkness']
            }),
            new Encounter({
                enemies: [new ClockworkAbomination(), new ClockworkAbomination()],
                difficulty: ActSegment.Act2_Segment1,
                rewardXP: 250
            }),
            new Encounter({
                enemies: [new GoblinCharacter(), new GoblinCharacter(), new GoblinCharacter()],
                difficulty: ActSegment.Act2_Segment2,
                rewardXP: 180
            }),
            new Encounter({
                enemies: [new BaconBeast(), new ClockworkAbomination(), new GoblinCharacter()],
                difficulty: ActSegment.Boss_Act2,
                rewardXP: 300,
                specialConditions: ['Ambush']
            }),
        ];
        const randomIndex = Math.floor(Math.random() * encounters.length);
        return encounters[randomIndex].data;
    }
}
