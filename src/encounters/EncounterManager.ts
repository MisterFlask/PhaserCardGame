import { AbstractEvent } from '../events/AbstractEvent';
import { EventsManager } from '../events/EventsManager';
import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent } from '../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../gamecharacters/AutomatedCharacter';
import { Delicious } from '../gamecharacters/buffs/enemy_buffs/Delicious';
import { Lethality } from '../gamecharacters/buffs/standard/Lethality';
import { Stress } from '../gamecharacters/buffs/standard/Stress';
import { Terrifying } from '../gamecharacters/buffs/standard/Terrifying';
import { CardSize } from '../gamecharacters/Primitives';
import { AbstractRelic } from '../relics/AbstractRelic';
import { RelicsLibrary } from '../relics/RelicsLibrary';
import { GameState } from '../rules/GameState';
import { CardModifier } from '../rules/modifiers/AbstractCardModifier';
import { RestEvent } from './events/RestEvent';
import { BloatedTreasurer } from './monsters/act1_boss/BloatedTreasurer';
import { FrenchBlindProphetess } from './monsters/act1_boss/FrenchBlindProphetess';
import { HermitProphetOfTheDelta } from './monsters/act1_boss/HermitProphetOfTheDelta';
import { HermitsTreasure } from './monsters/act1_boss/HermitsTreasure';
import { Brigand } from './monsters/act1_segment1/act1_segment0/Brigand';
import { StyxConstrictor } from './monsters/act1_segment1/act1_segment0/StyxConstrictor';
import { BogLampreyOUS } from './monsters/act1_segment1/BogLampreyOUS';
import { BrimstoneMudskipper } from './monsters/act1_segment1/BrimstoneMudskipper';
import { VesperOfMeat } from './monsters/act1_segment1/BrineBast';
import { DisgruntledFerryman } from './monsters/act1_segment1/DisgruntledFerryman';
import { BoatmanRevenant } from './monsters/act1_segment1/BoatmanRevenant';
import { FareEnforcer } from './monsters/act1_segment1/FareEnforcer';
import { GuildJourneyman } from './monsters/act1_segment1/GuildJourneyman';
import { Marshflutter } from './monsters/act1_segment1/Marshflutter';
import { Echophagist } from './monsters/act1_segment1/MarshStag';
import { SkeeterwispSwarm } from './monsters/act1_segment1/SkeeterwispSwarm';
import { SootLungHeron } from './monsters/act1_segment1/SootLungHeron';
import { TelegraphEel } from './monsters/act1_segment1/TelegraphEel';
import { WoodenTotem } from './monsters/act1_segment1/WoodenTotem';
import { EldritchMime } from './monsters/act1_segment2/CensorWisp';
import { RaftPirate } from './monsters/act1_segment2/RaftPirate';
import { Rootwrithe } from './monsters/act1_segment2/Rootwrithe';
import { RunoffElemental } from './monsters/act1_segment2/RunoffElemental';
import { TollCollectorGoneMad } from './monsters/act1_segment2/TollCollectorGoneMad';
import { WoodGolem } from './monsters/act1_segment2/WoodGolem';
import { LuridAutarch } from './monsters/act2_boss/LuridAutarch';
import { MarshalMortis } from './monsters/act2_boss/MarshalMortis';
import { TheFrostChancellor } from './monsters/act2_boss/TheFrostChancellor';
import { BureaucraticBehemoth } from './monsters/act2_segment1/BureaucraticBehemoth';
import { CrawlingInfestation } from './monsters/act2_segment1/CrawlingInfestation';
import { FrenchPoliceman } from './monsters/act2_segment1/FrenchPoliceman';
import { HiveBroodmother } from './monsters/act2_segment1/HiveBroodmother';
import { Lexiophage } from './monsters/act2_segment1/Lexiophage';
import { MitrailleuseOrganist } from './monsters/act2_segment1/MitrailleuseOrganist';
import { OldGuardGrenadier } from './monsters/act2_segment1/OldGuardGrenadier';
import { TrenchEngineer } from './monsters/act2_segment1/TrenchEngineer';
import { SorrowMothSwarm } from './monsters/act2_segment1/SorrowmothSwarm';
import { RevenantAuditor } from './monsters/act2_segment1/RevenantAuditor';
import { MaxwellCoilTrooper } from './monsters/act2_segment1/MaxwellCoilTrooper';
import { GrandArmeeDuelist } from './monsters/act2_segment1/GrandArmeeDuelist';
import { Artiste } from './monsters/act2_segment2/Artiste';
import { FrenchRestauranteur } from './monsters/act2_segment2/FrenchRestauranteur';
import { Grafter } from './monsters/act2_segment2/Grafter';
import { ZeppelinGrenadier } from './monsters/act2_segment2/ZeppelinGrenadier';
import { MaisonVachonQuartermaster } from './monsters/act2_segment2/MaisonVachonQuartermaster';
import { ReichsinfernokorpsLineBreaker } from './monsters/act2_segment2/ReichsinfernokorpsLineBreaker';
import { CompanyOverseer } from './monsters/act3_segment1/CompanyOverseer';
import { FurnaceForeman } from './monsters/act3_segment1/FurnaceForeman';
import { MechanicalScab } from './monsters/act3_segment1/MechanicalScab';
import { MoltenAgitator } from './monsters/act3_segment1/MoltenAgitator';
import { UnionEnforcer } from './monsters/act3_segment1/UnionEnforcer';
import { WildcatStriker } from './monsters/act3_segment1/WildcatStriker';
import { FoundryTick } from './monsters/act3_segment1/FoundryTick';
import { OverpressureStoker } from './monsters/act3_segment1/OverpressureStoker';
import { CompanyBailiff } from './monsters/act3_segment1/CompanyBailiff';
import { UnionRunner } from './monsters/act3_segment1/UnionRunner';
import { IroncladPicket } from './monsters/act3_segment1/IroncladPicket';
import { RegionalManager } from './monsters/act3_boss/RegionalManager';
import { TheRevolutionary } from './monsters/act3_boss/TheRevolutionary';
import { VentTick } from './monsters/act4_segment0/VentTick';
import { SlagPorter } from './monsters/act4_segment0/SlagPorter';
import { ChoirNovice } from './monsters/act4_segment0/ChoirNovice';
import { BellWarden } from './monsters/act4_segment1/BellWarden';
import { BrimstoneProspector } from './monsters/act4_segment1/BrimstoneProspector';
import { InterdictedHauler } from './monsters/act4_segment1/InterdictedHauler';
import { ChoirCantor } from './monsters/act4_segment1/ChoirCantor';
import { FoundrySeraph } from './monsters/act4_segment2/FoundrySeraph';
import { BaronsAssessor } from './monsters/act4_segment2/BaronsAssessor';
import { CalderaShambler } from './monsters/act4_segment2/CalderaShambler';
import { TheNinthBell } from './monsters/act4_boss/TheNinthBell';
// Define new character classes
export class ClockworkAbomination extends AutomatedCharacter {
    constructor() {
        // Balance note (measured 2026-07): a pure Stress-debuff intent with
        // no attack at all measured 100% greedy win rate at act3/squad3.
        // Stayed pegged at 100% through two passes (added a 7dmg attack at
        // 30 HP, then 9dmg attack at 42 HP; n=40/50/60). Third pass: HP
        // raised again and attack damage bumped once more.
        super({ name: 'Clockwork Abomination', portraitName: 'Clockwork Abomination', maxHitpoints: 55, description: 'One fears one might be post-ingestion, yet pre-digestion.' });
    }

    override generateNewIntents(): AbstractIntent[] {
        return [
            new AttackIntent({ baseDamage: 11, owner: this }).withTitle("Grinding Gears"),
            new ApplyDebuffToRandomCharacterIntent({ debuff: new Stress(1), owner: this }).withTitle("fascination")
        ]
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

    static readonly Act1_Segment0 = new ActSegmentData("Act 1 - Segment 0", 1, 0, [
        {
            enemies: [new StyxConstrictor(), new StyxConstrictor(), new StyxConstrictor()]
        },
        {
            enemies: [new Brigand(), new Brigand(), new Brigand()]
        }

    ]);

    static readonly Act1_Segment1 = new ActSegmentData("Act 1 - Segment 1", 1, 1, [
        {
            enemies: [new Marshflutter(), new Marshflutter()]
        },
        {
            enemies: [new Echophagist(), new Echophagist()]
        },
        {
            enemies: [new SkeeterwispSwarm(), new SkeeterwispSwarm()]
        },
        {
            enemies: [new BrimstoneMudskipper(), new SootLungHeron()]
        },
        {
            enemies: [new DisgruntledFerryman(), new DisgruntledFerryman()]
        },
        {
            enemies: [new TelegraphEel()]
        },
        {
            enemies: [new BogLampreyOUS()]
        },
        {
            enemies: [new BoatmanRevenant()]
        },
        {
            enemies: [new FareEnforcer()]
        },
        {
            enemies: [new GuildJourneyman()]
        }
    ]);

    static readonly Act1_Segment2 = new ActSegmentData("Act 1 - Segment 2", 1, 2, [
        {
            enemies: [new EldritchMime(), new EldritchMime()]
        },
        {
            enemies: [new WoodGolem(), new WoodGolem()]
        },
        {
            enemies: [new Rootwrithe()]
        },
        {
            enemies: [new RaftPirate(), new RaftPirate()]
        },
        {
            enemies: [new TollCollectorGoneMad()]
        },
        {
            enemies: [new RunoffElemental()]
        }
    ]);

    static readonly Boss_Act1 = new ActSegmentData("Boss Fight - Act 1", 1, 3, [
        {
            enemies: [new FrenchBlindProphetess(), new WoodenTotem(), new WoodenTotem()]
        },
        {
            enemies: [new BloatedTreasurer()]
        },
        {
            enemies: [new HermitProphetOfTheDelta(), new HermitsTreasure()]
        }
    ]);
    static readonly Act2_Segment0 = new ActSegmentData("Act 2 - Segment 1", 2, 0, [
        {
            enemies: [new FrenchPoliceman()]
        },
        {
            enemies: [new Lexiophage()]
        },
        {
            enemies: [new CrawlingInfestation()]
        },
    ]);

    static readonly Act2_Segment1 = new ActSegmentData("Act 2 - Segment 1", 2, 1, [
        {
            // Balance note (measured 2026-07): FrenchPoliceman x2 (175 HP each,
            // Penance+Guilt doubled -- cost-inflation and discard-exhaust
            // stacking twice over) measured 0% greedy win rate at squad 3,
            // n=30. Solo FrenchPoliceman alone measured only 16.7%, so the
            // duplicate is split into a solo entry here rather than paired
            // with itself again.
            enemies: [new FrenchPoliceman()]
        },
        {
            // Lexiophage x2 (PhilosophicalShield doubled -- both immune to
            // damage on any turn without a Skill played) measured 0% greedy
            // win rate, n=30. Split to solo.
            enemies: [new Lexiophage()]
        },
        {
            enemies: [new CrawlingInfestation()]
        },
        {
            enemies: [new HiveBroodmother()]
        },
        {
            enemies: [new SkeeterwispSwarm(), new SkeeterwispSwarm()]
        },
        {
            enemies: [new BureaucraticBehemoth()]
        },
        {
            enemies: [new MitrailleuseOrganist()]
        },
        {
            enemies: [new OldGuardGrenadier()]
        },
        {
            // TrenchEngineer x2 (Entrench: unhurt-this-turn grants Block +
            // stacking Lethality, and doubling halves the odds either one
            // goes unstruck) measured 6.7% greedy win rate, n=30. Split to
            // solo.
            enemies: [new TrenchEngineer()]
        },
        {
            enemies: [new SorrowMothSwarm()]
        },
        {
            enemies: [new RevenantAuditor()]
        },
        {
            enemies: [new MaxwellCoilTrooper(), new MaxwellCoilTrooper()]
        },
        {
            // GrandArmeeDuelist (immune to all but one Designated Foe) paired
            // with TrenchEngineer (self-tanking, self-buffing) measured 6.7%
            // greedy win rate, n=30, plus a thrown run. Re-paired with a
            // squishier partner (Skeeterwisp Swarm) so the party still has
            // something killable by the 3/4 members who aren't the Duelist's
            // target.
            enemies: [new GrandArmeeDuelist(), new SkeeterwispSwarm()]
        }
    ]);

    static readonly Act2_Segment2 = new ActSegmentData("Act 2 - Segment 2", 2, 2, [
        {
            enemies: [new Lexiophage(), new Lexiophage(), new Artiste()]
        },
        {
            enemies: [new VesperOfMeat(), new VesperOfMeat(), new FrenchRestauranteur()]
        },
        {
            enemies: [new ZeppelinGrenadier(), new ZeppelinGrenadier()]
        },
        {
            enemies: [new Grafter()]
        },
        {
            enemies: [new MaisonVachonQuartermaster()]
        },
        {
            enemies: [new ReichsinfernokorpsLineBreaker()]
        }
    ]);
    
    
    static readonly Boss_Act2 = new ActSegmentData("Boss Fight - Act 2", 2, 3, [
        {
            enemies: [new LuridAutarch()]
        },
        {
            enemies: [new MarshalMortis()]
        },
        {
            enemies: [new TheFrostChancellor()]
        }
    ]);

    static readonly Act3_Segment0 = new ActSegmentData("Act 3 - Segment 0", 3, 0, [
        {
            enemies: [new MechanicalScab(), new MechanicalScab()]
        },
        {
            enemies: [new ClockworkAbomination()]
        },
        {
            enemies: [new WildcatStriker(), new WildcatStriker()]
        },
        {
            enemies: [new FoundryTick(), new FoundryTick()]
        },
        {
            enemies: [new UnionRunner(), new WildcatStriker()]
        }
    ]);

    static readonly Act3_Segment1 = new ActSegmentData("Act 3 - Segment 1", 3, 1, [
        {
            // Balance note (measured 2026-07): UnionEnforcer x2 (165 HP each,
            // 330 combined, Armored(3)/turn, and RevolutionaryFervor(9) that
            // spikes the survivor's Lethality when its twin dies) measured
            // 0% greedy win rate at squad 3, n=30. Split to solo.
            enemies: [new UnionEnforcer()]
        },
        {
            enemies: [new MoltenAgitator()]
        },
        {
            // CompanyOverseer + FurnaceForeman together measured 0% greedy
            // win rate, n=30: both summon MechanicalScab reinforcements and
            // both carry Exploitation/Bloodsucker scaling, so the pairing
            // ran away on action economy. Un-paired below into two solo
            // entries so only one summoner is ever in a fight at a time.
            enemies: [new CompanyOverseer()]
        },
        {
            enemies: [new FurnaceForeman()]
        },
        {
            enemies: [new OverpressureStoker()]
        },
        {
            enemies: [new CompanyBailiff()]
        }
    ]);

    static readonly Act3_Segment2 = new ActSegmentData("Act 3 - Segment 2", 3, 2, [
        {
            enemies: [new BaconBeast()]
        },
        {
            enemies: [new BloodManipulationSlime()]
        },
        {
            enemies: [new CompanyOverseer(), new MechanicalScab()]
        },
        {
            enemies: [new IroncladPicket()]
        }
    ]);

    static readonly Boss_Act3 = new ActSegmentData("Boss Fight - Act 3", 3, 3, [
        {
            enemies: [new RegionalManager()]
        },
        {
            enemies: [new TheRevolutionary()]
        }
    ]);

    static readonly Act4_Segment0 = new ActSegmentData("Act 4 - Segment 0", 4, 0, [
        {
            enemies: [new VentTick(), new VentTick(), new VentTick()]
        },
        {
            enemies: [new SlagPorter()]
        },
        {
            enemies: [new ChoirNovice(), new ChoirNovice()]
        },
        {
            enemies: [new VentTick(), new SlagPorter()]
        },
        {
            enemies: [new ChoirNovice(), new VentTick()]
        }
    ]);

    static readonly Act4_Segment1 = new ActSegmentData("Act 4 - Segment 1", 4, 1, [
        {
            enemies: [new BellWarden()]
        },
        {
            enemies: [new BrimstoneProspector(), new BrimstoneProspector()]
        },
        {
            enemies: [new InterdictedHauler()]
        },
        {
            enemies: [new ChoirCantor(), new ChoirNovice()]
        },
        {
            enemies: [new BellWarden(), new BrimstoneProspector()]
        },
        {
            enemies: [new InterdictedHauler(), new ChoirNovice()]
        }
    ]);

    static readonly Act4_Segment2 = new ActSegmentData("Act 4 - Segment 2", 4, 2, [
        {
            enemies: [new FoundrySeraph()]
        },
        {
            enemies: [new BaronsAssessor()]
        },
        {
            enemies: [new CalderaShambler()]
        },
        {
            enemies: [new BaronsAssessor(), new ChoirCantor()]
        },
        {
            enemies: [new FoundrySeraph(), new ChoirNovice()]
        }
    ]);

    static readonly Boss_Act4 = new ActSegmentData("Boss Fight - Act 4", 4, 3, [
        {
            enemies: [new TheNinthBell()]
        }
    ]);
}

export class Encounter {

    getBackgroundName() {
        if (this.backgroundNameOverride) {
            return this.backgroundNameOverride;
        }

        // if this is the first act, take a random name from swamp backgrounds
        var swampBackgrounds = [
            "swamp-1",
            "swamp-2",
            "swamp-3",
            "eldritch-jungle-oil-painting",
            "forest-oil-painting",
        ]
        if (GameState.getInstance().currentAct == 1) {
            return swampBackgrounds[Math.floor(Math.random() * swampBackgrounds.length)];
        }

        // act-4: Brimstone Badlands volcanic extraction country draws from its
        // own dedicated backgrounds rather than the general-purpose Hell pool.
        var brimstoneBadlandsBackgrounds = [
            "brimstone-badlands-oil-painting-1",
            "brimstone-badlands-oil-painting-2",
        ]
        if (GameState.getInstance().currentAct == 4) {
            return brimstoneBadlandsBackgrounds[Math.floor(Math.random() * brimstoneBadlandsBackgrounds.length)];
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
    /**
     * If true, the associated event should trigger after combat instead of
     * immediately when the encounter begins.
     */
    eventAfterCombat: boolean = false;
    backgroundNameOverride?: string;

    constructor(
        enemies: AutomatedCharacter[],
        act: integer,
        segment: integer,
        event?: AbstractEvent,
        backgroundNameOverride?: string,
        eventAfterCombat: boolean = false
    ) {
        this.enemies = enemies;
        this.act = act;
        this.segment = segment;
        this.event = event;
        this.backgroundNameOverride = backgroundNameOverride;
        this.eventAfterCombat = eventAfterCombat;
    }
}

export class ShopGuy extends AutomatedCharacter {
    constructor() {
        super({ name: 'Arms Dealer', portraitName: 'shopkeeper_shady_symbol', maxHitpoints: 10, description: 'please buy something' });
        this.size = CardSize.LARGE;
        this.tags.push("shop_combat");
    }

    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 10, owner: this }).withTitle("rapture") ]
    }
}

export class CommoditiesGuy extends AutomatedCharacter {
    constructor() {
        super({ name: 'Commodities Trader', portraitName: 'capitalist_1', maxHitpoints: 10, description: "i'm serious, and i'm a professional"});
        this.tags.push("shop_sell_imports");
        this.size = CardSize.LARGE;
    }

    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 10, owner: this }).withTitle("joy") ]
    }
}


export class CursedGoodsTrader extends AutomatedCharacter {
    constructor() {
        super({ name: 'Artifact Salesman', portraitName: 'shopkeeper_spicy_symbol', maxHitpoints: 10, description: 'they fell off the back of a wagon' });
        this.tags.push("shop_buy_exports");
        this.size = CardSize.LARGE;
    }

    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 10, owner: this }).withTitle("joy") ]
    }
}

export class TreasureChest extends AutomatedCharacter {
    public relics: AbstractRelic[];
    
    constructor() {
        super({ 
            name: 'Treasure Chest', 
            portraitName: 'Torture Device Iron Maiden A', 
            maxHitpoints: 1, 
            description: 'REACH INSIDE FOR VALUABLE TREASURES' 
        });
        this.size = CardSize.LARGE;
        this.relics = RelicsLibrary.getInstance().getRandomBeneficialRelics(2);
        if (!this.relics || this.relics.length < 2) {
            throw new Error("Failed to retrieve relics");
        }
        this.portraitTargetLargestDimension = 600;
        this.portraitOffsetXOverride = -100
        this.portraitOffsetYOverride = 0
    }

    override generateNewIntents(): AbstractIntent[] {
        return []; // Treasure chest doesn't attack or have intents
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

    public getCommoditiesTrader(): Encounter {
        return new Encounter([new CommoditiesGuy()], GameState.getInstance().currentAct, 0);
    }

    public getShopEncounter(): Encounter {
        
        // todo: differentiate between acts
        var shopGuys = [new ShopGuy()];
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
    
    public getRandomCombatEncounter(act: integer, segment: integer): Encounter {
        const actSegment = Object.values(ActSegment).find(
            segmentData => segmentData.act === act && segmentData.segment === segment
        ) as ActSegmentData;
        if (!actSegment) {
            throw new Error(`No act segment found for act ${act}, segment ${segment}`);
        }

        var enemies = this.getRandomEnemiesListFromActSegmentNumbers(actSegment.act, actSegment.segment);
        var encounter = new Encounter(enemies.enemies, actSegment.act, actSegment.segment);

        return encounter;
        
    }
    public getRandomCombatEncounterFromSegment(actSegment: ActSegmentData): { enemies: AutomatedCharacter[] } {
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
    } else if (act == 3) {
        return ActSegment.Boss_Act3;
    } else if (act == 4) {
        return ActSegment.Boss_Act4;
    }
    throw new Error(`No boss encounters found for act ${act}`);
}

