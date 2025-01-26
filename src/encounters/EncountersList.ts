import { AbstractEvent } from '../events/AbstractEvent';
import { EventsManager } from '../events/EventsManager';
import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent } from '../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../gamecharacters/AutomatedCharacter';
import { Delicious } from '../gamecharacters/buffs/enemy_buffs/Delicious';
import { Stress } from '../gamecharacters/buffs/standard/Stress';
import { Lethality } from '../gamecharacters/buffs/standard/Strong';
import { Terrifying } from '../gamecharacters/buffs/standard/Terrifying';
import { CardSize } from '../gamecharacters/Primitives';
import { AbstractRelic } from '../relics/AbstractRelic';
import { RelicsLibrary } from '../relics/RelicsLibrary';
import { GameState } from '../rules/GameState';
import { CardModifier } from '../rules/modifiers/AbstractCardModifier';
import { RestEvent } from './events/RestEvent';
import { FrenchBlindProphetess } from './monsters/act1_boss/FrenchBlindProphetess';
import { FrenchChef } from './monsters/act1_segment1/FrenchChef';
import { FrenchCrow } from './monsters/act1_segment1/FrenchCrow';
import { FrenchDeer } from './monsters/act1_segment1/FrenchDeer';
import { VeilCapacitor } from './monsters/act1_segment1/VeilCapacitor';
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
        this.buffs.push(new Terrifying(1));
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
        public readonly encounters: { enemies: AutomatedCharacter[] }[] = []
    ) {}
}

export class ActSegment {
    static readonly Act1_Segment1 = new ActSegmentData("Act 1 - Segment 1", 1, 1, [
        {
            enemies: [new FrenchChef(), new FrenchChef(), new VeilCapacitor()]
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
            enemies: [new FrenchBlindProphetess(), new VeilCapacitor(), new VeilCapacitor()]
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

export class Encounter {

    getBackgroundName() {
        if (this.backgroundNameOverride) {
            return this.backgroundNameOverride;
        }
        var backgroundsPossible = [
            "backrooms-oil-painting",
            "canyon-oil-painting",
            "facility-oil-painting",
            "forest-oil-painting",
            "heaven-oil-painting",
            "hell-oil-painting-cold",
            "hell-oil-painting-foundry",
            "hell-oil-painting",
            "ruined-city-oil-painting",
            "shop-background-oil-painting",
            "green-facility-oil-painting",
            "eldritch-jungle-oil-painting",
            "planar-gate-oil-painting-1",
            "planar-gate-oil-painting-2"
        ]
        return backgroundsPossible[Math.floor(Math.random() * backgroundsPossible.length)];
    }

    peaceful: boolean = false;
    act: integer;
    segment: integer;
    enemies: AutomatedCharacter[];
    event?: AbstractEvent;
    backgroundNameOverride?: string;

    constructor(enemies: AutomatedCharacter[], act: integer, segment: integer, event?: AbstractEvent, backgroundNameOverride?: string) {
        this.enemies = enemies;
        this.act = act;
        this.segment = segment;
        this.event = event;
        this.backgroundNameOverride = backgroundNameOverride;
    }
}

export class ShopGuy extends AutomatedCharacter {
    constructor() {
        super({ name: 'Arms Dealer', portraitName: 'shopkeeper-spooky', maxHitpoints: 10, description: 'please buy something' });
        this.size = CardSize.LARGE;
        this.tags.push("shop_combat");
    }

    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 10, owner: this }).withTitle("rapture") ]
    }
}

export class CommoditiesGuy extends AutomatedCharacter {
    constructor() {
        super({ name: 'Commodities Trader', portraitName: 'shopkeeper-professional', maxHitpoints: 10, description: "i'm serious, and i'm a professional"});
        this.tags.push("shop_sell_imports");
        this.size = CardSize.LARGE;
    }

    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 10, owner: this }).withTitle("joy") ]
    }
}


export class CursedGoodsTrader extends AutomatedCharacter {
    constructor() {
        super({ name: 'Artifact Salesman', portraitName: 'shopkeeper-shady', maxHitpoints: 10, description: 'they fell off the back of a wagon' });
        this.tags.push("shop_buy_exports");
        this.size = CardSize.LARGE;
    }

    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 10, owner: this }).withTitle("joy") ]
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
        this.relic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        if (!this.relic) {
            throw new Error("Failed to retrieve a relic");
        }
    }

    override generateNewIntents(): AbstractIntent[] {
        return []; // Treasure chest doesn't attack or   have intents
    }
}

export class EncounterManager {
    public getBossEncounter(act: integer): Encounter {
        const segmentData = getBossSegment(act)
        if (!segmentData) {
            throw new Error(`No boss segment found for act ${act}`);
        }
        const encounter = this.getRandomEnemiesListFromActSegmentNumbers(segmentData.act, segmentData.segment);
        if (!encounter) {
            throw new Error(`No boss encounters found for act ${act}`);
        }
        if (encounter.enemies.length == 0) {
            throw new Error(`No enemies found for boss encounter for act ${act}`);
        }
        return new Encounter(encounter.enemies, segmentData.act, segmentData.segment);
    }
    private static instance: EncounterManager;

    private constructor() {}

    public static getInstance(): EncounterManager {
        if (!EncounterManager.instance) {
            EncounterManager.instance = new EncounterManager();
        }
        return EncounterManager.instance;
    }

    public getShopEncounter(): Encounter {
        
        // todo: differentiate between acts
        var shopGuys = [new ShopGuy()];
        shopGuys.push(new CommoditiesGuy());
        shopGuys.push(new CursedGoodsTrader());

        return new Encounter(shopGuys, GameState.getInstance().currentAct, 0);
    }

    getEventRoomEncounter(act: integer, segment: integer): Encounter {
        var encounter=  new Encounter([], act, segment, EventsManager.getInstance().getRandomEvent());
        encounter.peaceful = true;
        return encounter;
    }
    
    getRestEncounter(restSiteUpgradeOptions: CardModifier[]): Encounter {
        var encounter=  new Encounter([], GameState.getInstance().currentAct, -1, new RestEvent(restSiteUpgradeOptions));
        encounter.peaceful = true;
        return encounter;
    }
    
    public getRandomCombatEncounter(actSegment: ActSegmentData): { enemies: AutomatedCharacter[] } {
        return this.getRandomEnemiesListFromActSegmentNumbers(actSegment.act, actSegment.segment);
    }

    public getRandomEnemiesListFromActSegmentNumbers(act: integer, segment: integer): { enemies: AutomatedCharacter[] } {
        // Find the matching ActSegmentData
        const actSegment = Object.values(ActSegment).find(
            segmentData => segmentData.act === act && segmentData.segment === segment
        ) as ActSegmentData;

        if (!actSegment || actSegment.encounters.length === 0) {
            throw new Error(`No encounters found for act ${act}, segment ${segment}`);
        }

        const randomIndex = Math.floor(Math.random() * actSegment.encounters.length);
        return this.CopyEncounterEnemies(actSegment.encounters[randomIndex]);
    }

    public CopyEncounterEnemies(encounterData: { enemies: AutomatedCharacter[] }): { enemies: AutomatedCharacter[] } {
        return {
            enemies: encounterData.enemies.map(e => e.Copy())
        };
    }

    public getTreasureEncounter(): Encounter {
        return new Encounter([new TreasureChest()], 0, 0);
    }
}
function getBossSegment(act: number): ActSegmentData {

    if (act == 1) {
        return ActSegment.Boss_Act1;
    } else if (act == 2) {
        return ActSegment.Boss_Act2;
    }else if (act == 3) {
        // return ActSegment.Boss_Act3;
    }
    throw new Error(`No boss encounters found for act ${act}`);
}

