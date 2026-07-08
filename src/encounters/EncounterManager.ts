// Type-only import: Oppositions.ts is Phaser-free (house rule 1), so this
// stays safe even though EncounterManager itself is Phaser-tainted.
import type { OppositionId } from '../campaign/Oppositions';
import { pickEncounterIndex } from '../campaign/encounterSelection';
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
        // Reflavored 2026-07 (was "Breakfast Nightmares Bacon Beast",
        // placeholder dark-elf-assassin flavor): class name and portraitName
        // kept unchanged so no asset manifest churn is needed.
        super({ name: 'Rendering-Vat Shambler', portraitName: 'Breakfast Nightmares Bacon Beast', maxHitpoints: 25, description: 'Congealed tallow that walked out of the works canteen\'s rendering vats sometime after the third unfiled maintenance requisition. The Company classes it as foundry vermin and bills the canteen for the difference.' });
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
        // Reflavored 2026-07 (was "Blood Manipulation Slime", description
        // "Gross."): class name and portraitName kept unchanged so no asset
        // manifest churn is needed.
        super({ name: 'Quench-Trough Slime', portraitName: 'Blood Manipulation Slime', maxHitpoints: 20, description: 'What accumulates in the quench troughs when nobody files the maintenance requisition. The Company has opinions about whose department that requisition belonged to.' });
        this.buffs.push(new Lethality(3))

    }

    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 10, owner: this }).withTitle("rapture") ]
    }
}

/** One encounter table entry: its enemy grouping plus the opposition
 *  families those enemies belong to (drives contract-biased selection via
 *  src/campaign/encounterSelection.ts). Every entry in every table must
 *  carry at least one tag -- enforced by OppositionCoverageLint.test.ts. */
export interface EncounterEntry {
    enemies: AutomatedCharacter[];
    oppositions: OppositionId[];
}

export class ActSegmentData {
    constructor(
        public readonly displayName: string,
        public readonly act: number,
        public readonly segment: number,
        public readonly encounters: EncounterEntry[] = []
    ) {}
}

export class ActSegment {

    static readonly Act1_Segment0 = new ActSegmentData("Act 1 - Segment 0", 1, 0, [
        {
            enemies: [new StyxConstrictor(), new StyxConstrictor(), new StyxConstrictor()],
            oppositions: ['delta-fauna']
        },
        {
            enemies: [new Brigand(), new Brigand(), new Brigand()],
            oppositions: ['squatters-salvage']
        },
        {
            // Coverage: boatmens-guild had no segment-0 entry. New pairing,
            // not a new class -- matches this segment's weak solo/duo
            // envelope (existing entries here are 1-2 weak enemies).
            enemies: [new FareEnforcer()],
            oppositions: ['boatmens-guild']
        }

    ]);

    static readonly Act1_Segment1 = new ActSegmentData("Act 1 - Segment 1", 1, 1, [
        {
            enemies: [new Marshflutter(), new Marshflutter()],
            oppositions: ['delta-fauna']
        },
        {
            enemies: [new Echophagist(), new Echophagist()],
            oppositions: ['delta-fauna']
        },
        {
            enemies: [new SkeeterwispSwarm(), new SkeeterwispSwarm()],
            oppositions: ['delta-fauna']
        },
        {
            enemies: [new BrimstoneMudskipper(), new SootLungHeron()],
            oppositions: ['delta-fauna']
        },
        {
            enemies: [new DisgruntledFerryman(), new DisgruntledFerryman()],
            oppositions: ['boatmens-guild']
        },
        {
            enemies: [new TelegraphEel()],
            oppositions: ['delta-fauna']
        },
        {
            enemies: [new BogLampreyOUS()],
            oppositions: ['delta-fauna']
        },
        {
            enemies: [new BoatmanRevenant()],
            oppositions: ['boatmens-guild']
        },
        {
            enemies: [new FareEnforcer()],
            oppositions: ['boatmens-guild']
        },
        {
            enemies: [new GuildJourneyman()],
            oppositions: ['boatmens-guild']
        },
        {
            // Coverage: squatters-salvage had no segment-1 entry. New solo
            // pairing at this segment's existing weak-solo envelope.
            enemies: [new RaftPirate()],
            oppositions: ['squatters-salvage']
        }
    ]);

    static readonly Act1_Segment2 = new ActSegmentData("Act 1 - Segment 2", 1, 2, [
        {
            enemies: [new EldritchMime(), new EldritchMime()],
            oppositions: ['squatters-salvage']
        },
        {
            enemies: [new WoodGolem(), new WoodGolem()],
            oppositions: ['squatters-salvage']
        },
        {
            enemies: [new Rootwrithe()],
            oppositions: ['delta-fauna']
        },
        {
            enemies: [new RaftPirate(), new RaftPirate()],
            oppositions: ['squatters-salvage']
        },
        {
            enemies: [new TollCollectorGoneMad()],
            oppositions: ['squatters-salvage']
        },
        {
            enemies: [new RunoffElemental()],
            oppositions: ['squatters-salvage']
        },
        {
            // Coverage: boatmens-guild had no segment-2 entry. Recombines two
            // existing guild classes at this segment's duo envelope.
            enemies: [new GuildJourneyman(), new FareEnforcer()],
            oppositions: ['boatmens-guild']
        }
    ]);

    static readonly Boss_Act1 = new ActSegmentData("Boss Fight - Act 1", 1, 3, [
        {
            enemies: [new FrenchBlindProphetess(), new WoodenTotem(), new WoodenTotem()],
            oppositions: ['squatters-salvage', 'boatmens-guild']
        },
        {
            enemies: [new BloatedTreasurer()],
            oppositions: ['boatmens-guild']
        },
        {
            enemies: [new HermitProphetOfTheDelta(), new HermitsTreasure()],
            oppositions: ['delta-fauna']
        }
    ]);
    static readonly Act2_Segment0 = new ActSegmentData("Act 2 - Segment 1", 2, 0, [
        {
            enemies: [new FrenchPoliceman()],
            oppositions: ['grande-armee']
        },
        {
            enemies: [new Lexiophage()],
            oppositions: ['paper-horrors']
        },
        {
            enemies: [new CrawlingInfestation()],
            oppositions: ['paper-horrors']
        },
        {
            // Coverage: reichsinfernokorps had no segment-0 entry. Solo pick
            // of the family's weakest fielded member (MaxwellCoilTrooper),
            // matching this segment's existing solo envelope.
            enemies: [new MaxwellCoilTrooper()],
            oppositions: ['reichsinfernokorps']
        },
        {
            // Coverage: rear-echelon had no segment-0 entry. Solo pick,
            // matching this segment's weak-solo envelope.
            enemies: [new Grafter()],
            oppositions: ['rear-echelon']
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
            enemies: [new FrenchPoliceman()],
            oppositions: ['grande-armee']
        },
        {
            // Lexiophage x2 (PhilosophicalShield doubled -- both immune to
            // damage on any turn without a Skill played) measured 0% greedy
            // win rate, n=30. Split to solo.
            enemies: [new Lexiophage()],
            oppositions: ['paper-horrors']
        },
        {
            enemies: [new CrawlingInfestation()],
            oppositions: ['paper-horrors']
        },
        {
            enemies: [new HiveBroodmother()],
            oppositions: ['paper-horrors']
        },
        {
            enemies: [new SkeeterwispSwarm(), new SkeeterwispSwarm()],
            oppositions: ['delta-fauna']
        },
        {
            enemies: [new BureaucraticBehemoth()],
            oppositions: ['paper-horrors']
        },
        {
            enemies: [new MitrailleuseOrganist()],
            oppositions: ['grande-armee']
        },
        {
            enemies: [new OldGuardGrenadier()],
            oppositions: ['grande-armee']
        },
        {
            // TrenchEngineer x2 (Entrench: unhurt-this-turn grants Block +
            // stacking Lethality, and doubling halves the odds either one
            // goes unstruck) measured 6.7% greedy win rate, n=30. Split to
            // solo.
            enemies: [new TrenchEngineer()],
            oppositions: ['grande-armee']
        },
        {
            enemies: [new SorrowMothSwarm()],
            oppositions: ['paper-horrors']
        },
        {
            enemies: [new RevenantAuditor()],
            oppositions: ['grande-armee']
        },
        {
            enemies: [new MaxwellCoilTrooper(), new MaxwellCoilTrooper()],
            oppositions: ['reichsinfernokorps']
        },
        {
            // GrandArmeeDuelist (immune to all but one Designated Foe) paired
            // with TrenchEngineer (self-tanking, self-buffing) measured 6.7%
            // greedy win rate, n=30, plus a thrown run. Re-paired with a
            // squishier partner (Skeeterwisp Swarm) so the party still has
            // something killable by the 3/4 members who aren't the Duelist's
            // target.
            enemies: [new GrandArmeeDuelist(), new SkeeterwispSwarm()],
            oppositions: ['grande-armee', 'delta-fauna']
        },
        {
            // Coverage: rear-echelon had no segment-1 entry. Solo pick,
            // matching this segment's existing weak-solo entries (Lexiophage,
            // TrenchEngineer et al).
            enemies: [new Grafter()],
            oppositions: ['rear-echelon']
        }
    ]);

    static readonly Act2_Segment2 = new ActSegmentData("Act 2 - Segment 2", 2, 2, [
        {
            enemies: [new Lexiophage(), new Lexiophage(), new Artiste()],
            oppositions: ['paper-horrors', 'rear-echelon']
        },
        {
            enemies: [new VesperOfMeat(), new VesperOfMeat(), new FrenchRestauranteur()],
            oppositions: ['rear-echelon']
        },
        {
            enemies: [new ZeppelinGrenadier(), new ZeppelinGrenadier()],
            oppositions: ['reichsinfernokorps']
        },
        {
            enemies: [new Grafter()],
            oppositions: ['rear-echelon']
        },
        {
            enemies: [new MaisonVachonQuartermaster()],
            oppositions: ['rear-echelon']
        },
        {
            enemies: [new ReichsinfernokorpsLineBreaker()],
            oppositions: ['reichsinfernokorps']
        },
        {
            // Coverage: grande-armee had no segment-2 entry. Recombines two
            // existing grande-armee classes from segment 1 at this segment's
            // duo envelope.
            enemies: [new OldGuardGrenadier(), new RevenantAuditor()],
            oppositions: ['grande-armee']
        }
    ]);


    static readonly Boss_Act2 = new ActSegmentData("Boss Fight - Act 2", 2, 3, [
        {
            enemies: [new LuridAutarch()],
            oppositions: ['grande-armee']
        },
        {
            enemies: [new MarshalMortis()],
            oppositions: ['grande-armee']
        },
        {
            enemies: [new TheFrostChancellor()],
            oppositions: ['reichsinfernokorps']
        }
    ]);

    static readonly Act3_Segment0 = new ActSegmentData("Act 3 - Segment 0", 3, 0, [
        {
            enemies: [new MechanicalScab(), new MechanicalScab()],
            oppositions: ['company-men']
        },
        {
            enemies: [new ClockworkAbomination()],
            oppositions: ['company-men']
        },
        {
            enemies: [new WildcatStriker(), new WildcatStriker()],
            oppositions: ['stokers-union']
        },
        {
            enemies: [new FoundryTick(), new FoundryTick()],
            oppositions: ['foundry-vermin']
        },
        {
            enemies: [new UnionRunner(), new WildcatStriker()],
            oppositions: ['stokers-union']
        }
    ]);

    static readonly Act3_Segment1 = new ActSegmentData("Act 3 - Segment 1", 3, 1, [
        {
            // Balance note (measured 2026-07): UnionEnforcer x2 (165 HP each,
            // 330 combined, Armored(3)/turn, and RevolutionaryFervor(9) that
            // spikes the survivor's Lethality when its twin dies) measured
            // 0% greedy win rate at squad 3, n=30. Split to solo.
            enemies: [new UnionEnforcer()],
            oppositions: ['stokers-union']
        },
        {
            enemies: [new MoltenAgitator()],
            oppositions: ['stokers-union']
        },
        {
            // CompanyOverseer + FurnaceForeman together measured 0% greedy
            // win rate, n=30: both summon MechanicalScab reinforcements and
            // both carry Exploitation/Bloodsucker scaling, so the pairing
            // ran away on action economy. Un-paired below into two solo
            // entries so only one summoner is ever in a fight at a time.
            enemies: [new CompanyOverseer()],
            oppositions: ['company-men']
        },
        {
            enemies: [new FurnaceForeman()],
            oppositions: ['company-men']
        },
        {
            enemies: [new OverpressureStoker()],
            oppositions: ['stokers-union']
        },
        {
            enemies: [new CompanyBailiff()],
            oppositions: ['company-men']
        },
        {
            // Coverage: foundry-vermin had no segment-1 entry. Recombines the
            // family's only fielded class at this segment's existing solo
            // envelope (FoundryTick appears solo/duo in segment 0).
            enemies: [new FoundryTick()],
            oppositions: ['foundry-vermin']
        }
    ]);

    static readonly Act3_Segment2 = new ActSegmentData("Act 3 - Segment 2", 3, 2, [
        {
            enemies: [new BaconBeast()],
            oppositions: ['foundry-vermin']
        },
        {
            enemies: [new BloodManipulationSlime()],
            oppositions: ['foundry-vermin']
        },
        {
            enemies: [new CompanyOverseer(), new MechanicalScab()],
            oppositions: ['company-men']
        },
        {
            enemies: [new IroncladPicket()],
            oppositions: ['stokers-union']
        }
    ]);

    static readonly Boss_Act3 = new ActSegmentData("Boss Fight - Act 3", 3, 3, [
        {
            enemies: [new RegionalManager()],
            oppositions: ['company-men']
        },
        {
            enemies: [new TheRevolutionary()],
            oppositions: ['stokers-union']
        }
    ]);

    static readonly Act4_Segment0 = new ActSegmentData("Act 4 - Segment 0", 4, 0, [
        {
            enemies: [new VentTick(), new VentTick(), new VentTick()],
            oppositions: ['vent-fauna']
        },
        {
            enemies: [new SlagPorter()],
            oppositions: ['barons-interests']
        },
        {
            enemies: [new ChoirNovice(), new ChoirNovice()],
            oppositions: ['iron-choir']
        },
        {
            enemies: [new VentTick(), new SlagPorter()],
            oppositions: ['vent-fauna', 'barons-interests']
        },
        {
            enemies: [new ChoirNovice(), new VentTick()],
            oppositions: ['iron-choir', 'vent-fauna']
        }
    ]);

    static readonly Act4_Segment1 = new ActSegmentData("Act 4 - Segment 1", 4, 1, [
        {
            enemies: [new BellWarden()],
            oppositions: ['iron-choir']
        },
        {
            enemies: [new BrimstoneProspector(), new BrimstoneProspector()],
            oppositions: ['barons-interests']
        },
        {
            enemies: [new InterdictedHauler()],
            oppositions: ['barons-interests']
        },
        {
            enemies: [new ChoirCantor(), new ChoirNovice()],
            oppositions: ['iron-choir']
        },
        {
            enemies: [new BellWarden(), new BrimstoneProspector()],
            oppositions: ['iron-choir', 'barons-interests']
        },
        {
            enemies: [new InterdictedHauler(), new ChoirNovice()],
            oppositions: ['barons-interests', 'iron-choir']
        },
        {
            // Coverage: vent-fauna had no segment-1 entry. Solo pick of the
            // family's weaker fielded member (VentTick appears in triples at
            // segment 0), matching this segment's solo/duo envelope.
            enemies: [new VentTick(), new VentTick()],
            oppositions: ['vent-fauna']
        }
    ]);

    static readonly Act4_Segment2 = new ActSegmentData("Act 4 - Segment 2", 4, 2, [
        {
            enemies: [new FoundrySeraph()],
            oppositions: ['iron-choir']
        },
        {
            enemies: [new BaronsAssessor()],
            oppositions: ['barons-interests']
        },
        {
            enemies: [new CalderaShambler()],
            oppositions: ['vent-fauna']
        },
        {
            enemies: [new BaronsAssessor(), new ChoirCantor()],
            oppositions: ['barons-interests', 'iron-choir']
        },
        {
            enemies: [new FoundrySeraph(), new ChoirNovice()],
            oppositions: ['iron-choir']
        }
    ]);

    static readonly Boss_Act4 = new ActSegmentData("Boss Fight - Act 4", 4, 3, [
        {
            enemies: [new TheNinthBell()],
            oppositions: ['iron-choir']
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
    public getBossEncounter(act: integer, opposition?: string): Encounter {
        const segmentData = getBossSegment(act)
        if (!segmentData) {
            throw new Error(`No boss segment found for act ${act}`);
        }
        const encounter = this.getRandomEnemiesListFromActSegmentNumbers(segmentData.act, segmentData.segment, opposition);
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
    
    public getRandomCombatEncounter(act: integer, segment: integer, opposition?: string): Encounter {
        const actSegment = Object.values(ActSegment).find(
            segmentData => segmentData.act === act && segmentData.segment === segment
        ) as ActSegmentData;
        if (!actSegment) {
            throw new Error(`No act segment found for act ${act}, segment ${segment}`);
        }

        var enemies = this.getRandomEnemiesListFromActSegmentNumbers(actSegment.act, actSegment.segment, opposition);
        var encounter = new Encounter(enemies.enemies, actSegment.act, actSegment.segment);

        return encounter;

    }
    public getRandomCombatEncounterFromSegment(actSegment: ActSegmentData, opposition?: string): { enemies: AutomatedCharacter[] } {
        return this.getRandomEnemiesListFromActSegmentNumbers(actSegment.act, actSegment.segment, opposition);
    }

    public getRandomEnemiesListFromActSegmentNumbers(act: integer, segment: integer, opposition?: string): { enemies: AutomatedCharacter[] } {
        // Find the matching ActSegmentData
        const actSegment = Object.values(ActSegment).find(
            segmentData => segmentData.act === act && segmentData.segment === segment
        ) as ActSegmentData;

        if (!actSegment || actSegment.encounters.length === 0) {
            throw new Error(`No encounters found for act ${act}, segment ${segment}`);
        }

        const entryOppositions = actSegment.encounters.map(e => e.oppositions);
        const { index } = pickEncounterIndex(entryOppositions, opposition);
        return this.CopyEncounterEnemies(actSegment.encounters[index]);
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

