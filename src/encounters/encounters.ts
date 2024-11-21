import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent } from '../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../gamecharacters/AutomatedCharacter';
import { Delicious } from '../gamecharacters/buffs/enemy_buffs/Delicious';
import { Stress } from '../gamecharacters/buffs/standard/Stress';
import { Stressful } from '../gamecharacters/buffs/standard/Stressful';
import { Lethality } from '../gamecharacters/buffs/standard/Strong';
import { AbstractRelic } from '../relics/AbstractRelic';
import { RelicsLibrary } from '../relics/RelicsLibrary';
import { FrenchBlindProphetess } from './monsters/act1_boss/FrenchBlindProphetess';
import { FrenchChef } from './monsters/act1_segment1/FrenchChef';
import { FrenchCrow } from './monsters/act1_segment1/FrenchCrow';
import { FrenchDeer } from './monsters/act1_segment1/FrenchDeer';
import { FrenchTotem } from './monsters/act1_segment1/FrenchTotem';
import { FrenchLumberjack } from './monsters/act1_segment2/FrenchLumberjack';
import { FrenchMime } from './monsters/act1_segment2/FrenchMime';
import { FrenchCaptain } from './monsters/act2_boss/FrenchCaptain';
import { FrenchIntellectual } from './monsters/act2_segment1/FrenchIntellectual';
import { FrenchPoliceman } from './monsters/act2_segment1/FrenchPoliceman';
import { Artiste } from './monsters/act2_segment2/Artiste';
import { FrenchRestauranteur } from './monsters/act2_segment2/FrenchRestauranteur';

// Define new character classes
export class ClockworkAbomination extends AutomatedCharacter {
    constructor() {
        super({ name: 'Clockwork Abomination', portraitName: 'Clockwork Abomination', maxHitpoints: 30, description: 'One fears one might be post-ingestion, yet pre-digestion.' });
    }
    
    override generateNewIntents(): AbstractIntent[] {
        return [ new ApplyDebuffToRandomCharacterIntent({ debuff: new Stress(1), owner: this }).withTitle("fascination") ]
    }
}

export class BaconBeast extends AutomatedCharacter {
    constructor() {
        super({ name: 'Breakfast Nightmares Bacon Beast', portraitName: 'Breakfast Nightmares Bacon Beast', maxHitpoints: 25, description: 'A cunning dark elf assassin' });
        this.buffs.push(new Lethality(2))
        this.buffs.push(new Delicious(1));
        this.buffs.push(new Stressful(1));
    }
    

    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 6, owner: this }).withTitle("bite") ]
    }
}

export class BloodManipulationSlime extends AutomatedCharacter {
    constructor() {
        super({ name: 'Blood Manipulation Slime', portraitName: 'Blood Manipulation Slime', maxHitpoints: 20, description: 'Gross.' });
        this.buffs.push(new Lethality(3))

    }
    
    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 10, owner: this }).withTitle("rapture") ]
    }
}

export class ActSegmentData {
    constructor(
        public readonly displayName: string,
        public readonly act: number,
        public readonly segment: number,
        public readonly encounters: EncounterData[] = []
    ) {}
}

export class ActSegment {
    static readonly Act1_Segment1 = new ActSegmentData("Act 1 - Segment 1", 1, 1, [
        {
            enemies: [new FrenchChef(), new FrenchChef(), new FrenchTotem()]
        },
        {
            enemies: [new FrenchCrow(), new FrenchCrow()]
        },
        {
            enemies: [new FrenchDeer(), new FrenchDeer()]
        }
    ]);

    static readonly Act1_Segment2 = new ActSegmentData("Act 1 - Segment 2", 1, 2, [
        {
            enemies: [new FrenchMime(), new FrenchMime()]
        },
        {
            enemies: [new FrenchLumberjack(), new FrenchLumberjack()]
        }
    ]);

    static readonly Boss_Act1 = new ActSegmentData("Boss Fight - Act 1", 1, 3, [
        {
            enemies: [new FrenchBlindProphetess(), new FrenchTotem(), new FrenchTotem()]
        },
    ]);

    static readonly Act2_Segment1 = new ActSegmentData("Act 2 - Segment 1", 2, 1, [
        {
            enemies: [new FrenchPoliceman(), new FrenchPoliceman()]
        },
        {
            enemies: [new FrenchIntellectual(), new FrenchIntellectual()]
        }
    ]);

    static readonly Act2_Segment2 = new ActSegmentData("Act 2 - Segment 2", 2, 2, [
        {
            enemies: [new FrenchIntellectual(), new FrenchIntellectual(), new Artiste()]
        },
        {
            enemies: [new FrenchChef(), new FrenchChef(), new FrenchRestauranteur()]
        }
    ]);
    
    
    static readonly Boss_Act2 = new ActSegmentData("Boss Fight - Act 2", 2, 3, [
        {
            enemies: [new FrenchCaptain()]
        }
    ]);
}

export interface EncounterData {
    enemies: AutomatedCharacter[];
}

export class Encounter {
    data: EncounterData;
    peaceful: boolean = false;
    act: integer;
    segment: integer;
    constructor(data: EncounterData, act: integer, segment: integer) {
        this.data = data;
        this.act = act;
        this.segment = segment;
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

export class TreasureChest extends AutomatedCharacter {
    public relic?: AbstractRelic;
    
    constructor() {
        super({ 
            name: 'Treasure Chest', 
            portraitName: 'TreasureChest', 
            maxHitpoints: 1, 
            description: 'Contains valuable treasures' 
        });
        this.relic = RelicsLibrary.getInstance().getRandomRelics(1)[0];
        if (!this.relic) {
            throw new Error("Failed to retrieve a relic");
        }
    }

    override generateNewIntents(): AbstractIntent[] {
        return []; // Treasure chest doesn't attack or have intents
    }
}

export class EncounterManager {
    private static instance: EncounterManager;

    private constructor() {}

    public static getInstance(): EncounterManager {
        if (!EncounterManager.instance) {
            EncounterManager.instance = new EncounterManager();
        }
        return EncounterManager.instance;
    }

    public getShopEncounter(): Encounter {
        return new Encounter({
            enemies: [new ShopGuy()]
        }, 0, 0);
    }

    public getRandomEncounter(actSegment: ActSegmentData): EncounterData {
        return this.getRandomEncounterFromActSegmentNumbers(actSegment.act, actSegment.segment);
    }

    public getRandomEncounterFromActSegmentNumbers(act: integer, segment: integer): EncounterData {
        // Find the matching ActSegmentData
        const actSegment = Object.values(ActSegment).find(
            segmentData => segmentData.act === act && segmentData.segment === segment
        ) as ActSegmentData;

        if (!actSegment || actSegment.encounters.length === 0) {
            throw new Error(`No encounters found for act ${act}, segment ${segment}`);
        }

        const randomIndex = Math.floor(Math.random() * actSegment.encounters.length);
        return this.CopyEncounterData(actSegment.encounters[randomIndex]);
    }

    public CopyEncounterData(encounterData: EncounterData): EncounterData {
        return {
            enemies: encounterData.enemies.map(e => e.Copy())
        };
    }

    public getTreasureEncounter(): Encounter {
        return {
            data: {
                enemies: [new TreasureChest()],
            },
            peaceful: true,
            act: 0,
            segment: 0
        };
    }
}
