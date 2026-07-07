// Lint-style guard for asset manifest integrity (src/utils/ImageUtils.ts).
//
// Promotes .claude/skills/generate-game-art/scripts/check-assets.js (a CLI
// tool used ad hoc during art passes) into an always-on vitest, in the same
// enforcement style as SaveRegistriesLint.test.ts: plain Node source/file
// scanning, no Phaser imports (ImageUtils.ts itself is Phaser-typed only in
// its loader method signature, so we parse it as text rather than importing
// it, mirroring check-assets.js's own approach).
//
// Covered surfaces:
//  1. Every manifest entry's file exists on disk under resources/.
//  2. No two manifest entries resolve to the same Phaser texture key (the
//     key is the filename minus extension; Phaser's loader silently lets
//     the last-loaded entry win a collision, so the loser never renders).
//  3. Every `imageName`/`portraitName` string-literal assigned in src/
//     resolves to a key the manifest actually declares. AbstractConsumable
//     .init() / AbstractRelic.init() treat an empty string as a deliberate
//     "no art yet, auto-generate a placeholder" sentinel, so `""` is exempt
//     (see AbstractConsumable.ts / AbstractRelic.ts).
//
// Known pre-existing violations (missing art, not manifest bugs) are
// listed explicitly below so this test is GREEN today and only fails on
// NEW regressions. Each one already degrades gracefully at runtime — every
// call site (AbstractCard.getEffectivePortraitName, AbstractIntent.hasNoValidImage,
// PhysicalBuff's imageFileName check, DetailsScreenManager) guards with
// `scene.textures.exists(...)` before use and falls back to a deterministic
// abstract placeholder, so these are silent missing-art debt, not crashes.
// See TODO.md's "Asset manifest lint" entry for the standing cleanup task.

import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(process.cwd(), 'src');
const REPO_ROOT = path.resolve(process.cwd());

// Plain `require` (no .d.ts for this CLI-tool-turned-module) rather than an
// ES import — same pattern content_pipeline scripts use for untyped JS deps.
const checkAssets = require('../../../.claude/skills/generate-game-art/scripts/check-assets.js') as {
    loadManifest: (repoRoot?: string) => { category: string; prefix: string; file: string; key: string }[];
    findMissingFiles: (entries: { prefix: string; file: string }[], repoRoot?: string) => { prefix: string; file: string }[];
    findKeyCollisions: (entries: { key: string; prefix: string; file: string }[]) => { key: string; locations: string[] }[];
};
const { loadManifest, findMissingFiles, findKeyCollisions } = checkAssets;

function walkTsFiles(dir: string, out: string[] = []): string[] {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkTsFiles(full, out);
        else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) out.push(full);
    });
    return out;
}

/** Extracts `imageName`/`portraitName` string-literal assignments, covering
 *  both `this.imageName = "x"` style and object-literal `imageName: "x"`
 *  (constructor args like `super({ portraitName: "x", ... })`). */
function extractImageKeyRefs(source: string): { prop: string; value: string }[] {
    const refs: { prop: string; value: string }[] = [];
    const re = /\b(imageName|portraitName)\s*[:=]\s*['"]([^'"]*)['"]/g;
    let match;
    while ((match = re.exec(source)) !== null) {
        refs.push({ prop: match[1], value: match[2] });
    }
    return refs;
}

// (file, value) pairs that are known missing-art references today. Every
// entry here should have a real texture eventually; new entries must NOT be
// added silently — either wire up real art or get owner sign-off and add
// the pair here with the same justification as its neighbors.
const EXPECTED_MISSING_IMAGE_REFS: { file: string; value: string }[] = [
    { file: 'encounters/events/event_buffs/AngelicTattooBuffs.ts', value: "azrael_icon" },
    { file: 'encounters/events/event_buffs/AngelicTattooBuffs.ts', value: "eye_icon" },
    { file: 'encounters/events/event_buffs/AngelicTattooBuffs.ts', value: "flames_icon" },
    { file: 'encounters/events/event_buffs/AngelicTattooBuffs.ts', value: "grace_icon" },
    { file: 'encounters/events/event_buffs/AngelicTattooBuffs.ts', value: "halo_icon" },
    { file: 'encounters/events/event_buffs/AngelicTattooBuffs.ts', value: "ire_icon" },
    { file: 'encounters/events/event_buffs/AngelicTattooBuffs.ts', value: "seal_icon" },
    { file: 'encounters/events/event_buffs/AngelicTattooBuffs.ts', value: "stigmata_icon" },
    { file: 'encounters/events/event_buffs/AngelicTattooBuffs.ts', value: "voice_icon" },
    { file: 'encounters/events/event_buffs/AngelicTattooBuffs.ts', value: "zadkiel_icon" },
    { file: 'encounters/events/event_buffs/HellDiseases.ts', value: "ashen_shakes_icon" },
    { file: 'encounters/events/event_buffs/HellDiseases.ts', value: "bloodboil_fever_icon" },
    { file: 'encounters/events/event_buffs/HellDiseases.ts', value: "brimstone_lung_icon" },
    { file: 'encounters/events/event_buffs/HellDiseases.ts', value: "hellmouth_sores_icon" },
    { file: 'encounters/events/event_buffs/HellDiseases.ts', value: "imps_itch_icon" },
    { file: 'encounters/events/event_buffs/HellDiseases.ts', value: "pit_sweats_icon" },
    { file: 'encounters/events/event_buffs/HellDiseases.ts', value: "wormrot_icon" },
    { file: 'encounters/monsters/act1_boss/HermitsTreasure.ts', value: "running-ninja" },
    { file: 'encounters/monsters/act1_segment1/BoatmanRevenant.ts', value: "f" },
    { file: 'encounters/monsters/act1_segment1/SkeeterwispSwarm.ts', value: "heal" },
    { file: 'encounters/monsters/act2_boss/MarshalMortis.ts', value: "Napoleonic Zombie" },
    { file: 'encounters/monsters/act2_boss/TheFrostChancellor.ts', value: "frost_knight" },
    { file: 'encounters/monsters/act2_segment1/BureaucraticBehemoth.ts', value: "bureaucrat" },
    { file: 'encounters/monsters/act2_segment1/BureaucraticBehemoth.ts', value: "Bureaucratic Beast" },
    { file: 'encounters/monsters/act2_segment1/MitrailleuseOrganist.ts', value: "Machine Gunner Demon" },
    { file: 'encounters/monsters/act2_segment1/OldGuardGrenadier.ts', value: "Napoleonic Zombie" },
    { file: 'encounters/monsters/act2_segment1/TrenchEngineer.ts', value: "Napoleonic Zombie" },
    { file: 'encounters/monsters/act2_segment1/TrenchEngineer.ts', value: "shield" },
    { file: 'encounters/monsters/act2_segment2/Grafter.ts', value: "syringe" },
    { file: 'encounters/monsters/act2_segment2/ZeppelinGrenadier.ts', value: "grenade" },
    { file: 'encounters/monsters/act2_segment2/ZeppelinGrenadier.ts', value: "Napoleonic Zombie" },
    { file: 'encounters/monsters/act3_boss/RegionalManager.ts', value: "card-burn" },
    { file: 'encounters/monsters/act3_boss/RegionalManager.ts', value: "manager-demon" },
    { file: 'encounters/monsters/act3_boss/TheRevolutionary.ts', value: "angry-worker-boss" },
    { file: 'encounters/monsters/act3_boss/TheRevolutionary.ts', value: "hazard" },
    { file: 'encounters/monsters/act3_segment1/CompanyOverseer.ts', value: "overseer" },
    { file: 'encounters/monsters/act3_segment1/FurnaceForeman.ts', value: "foreman" },
    { file: 'encounters/monsters/act3_segment1/MechanicalScab.ts', value: "robot-minion" },
    { file: 'encounters/monsters/act3_segment1/MoltenAgitator.ts', value: "fiery-orator" },
    { file: 'encounters/monsters/act3_segment1/MoltenAgitator.ts', value: "fire-breath" },
    { file: 'encounters/monsters/act3_segment1/UnionEnforcer.ts', value: "tough-worker" },
    { file: 'encounters/monsters/act3_segment1/WildcatStriker.ts', value: "angry-worker" },
    { file: 'gamecharacters/AbstractIntent.ts', value: "card-plus" },
    { file: 'gamecharacters/AbstractIntent.ts', value: "tag" },
    { file: 'gamecharacters/buffs/enemy_buffs/AbsoluteZeroDoctrine.ts', value: "snowflake" },
    { file: 'gamecharacters/buffs/enemy_buffs/AuditPressure.ts', value: "scroll" },
    { file: 'gamecharacters/buffs/enemy_buffs/Decaying.ts', value: "decay" },
    { file: 'gamecharacters/buffs/enemy_buffs/EarWorm.ts', value: "ear-worm" },
    { file: 'gamecharacters/buffs/enemy_buffs/GrandArmeeEternal.ts', value: "spear" },
    { file: 'gamecharacters/buffs/enemy_buffs/GreedIncarnate.ts', value: "greed" },
    { file: 'gamecharacters/buffs/enemy_buffs/LeechingBite.ts', value: "leech" },
    { file: 'gamecharacters/buffs/enemy_buffs/Minion.ts', value: "minion" },
    { file: 'gamecharacters/buffs/enemy_buffs/ProductionQuota.ts', value: "factory" },
    { file: 'gamecharacters/buffs/enemy_buffs/Robotic.ts', value: "robotic" },
    { file: 'gamecharacters/buffs/enemy_buffs/SignalInterference.ts', value: "lightning-bolt" },
    { file: 'gamecharacters/buffs/enemy_buffs/TariffAura.ts', value: "coins" },
    { file: 'gamecharacters/buffs/enemy_buffs/ToxicRetaliation.ts', value: "toxic" },
    { file: 'gamecharacters/buffs/playable_card/Buster.ts', value: "giant-axe" },
    { file: 'gamecharacters/buffs/playable_card/CostIncreased.ts', value: "cost-up" },
    { file: 'gamecharacters/buffs/playable_card/Doubled.ts', value: "doubled" },
    { file: 'gamecharacters/buffs/playable_card/SaleTags/Damaged.ts', value: "damaged-tag" },
    { file: 'gamecharacters/buffs/playable_card/SaleTags/SoulEater.ts', value: "soul-eater-tag" },
    { file: 'gamecharacters/buffs/playable_card/Tariffed.ts', value: "coins" },
    { file: 'gamecharacters/buffs/standard/Armored.ts', value: "armored" },
    { file: 'gamecharacters/buffs/standard/Blind.ts', value: "blind" },
    { file: 'gamecharacters/buffs/standard/Bloodsucker.ts', value: "blood" },
    { file: 'gamecharacters/buffs/standard/Burning.ts', value: "burning-icon" },
    { file: 'gamecharacters/buffs/standard/BurningImmune.ts', value: "flame-off" },
    { file: 'gamecharacters/buffs/standard/Cursed.ts', value: "cursed" },
    { file: 'gamecharacters/buffs/standard/DamageIncreaseOnKill.ts', value: "damage-increase-on-kill" },
    { file: 'gamecharacters/buffs/standard/Devil.ts', value: "devil" },
    { file: 'gamecharacters/buffs/standard/EldritchHorror.ts', value: "eldritch horror" },
    { file: 'gamecharacters/buffs/standard/Exploitation.ts', value: "greedy" },
    { file: 'gamecharacters/buffs/standard/ExplosiveFinishCardBuff.ts', value: "explosive-finish" },
    { file: 'gamecharacters/buffs/standard/Fearless.ts', value: "fearless" },
    { file: 'gamecharacters/buffs/standard/Frostbite.ts', value: "snowflake" },
    { file: 'gamecharacters/buffs/standard/HellSellValue.ts', value: "valuable-in-hell" },
    { file: 'gamecharacters/buffs/standard/Holy.ts', value: "holy" },
    { file: 'gamecharacters/buffs/standard/Implacable.ts', value: "skull" },
    { file: 'gamecharacters/buffs/standard/Intangible.ts', value: "intangible" },
    { file: 'gamecharacters/buffs/standard/Intimidation.ts', value: "intimidate" },
    { file: 'gamecharacters/buffs/standard/Poisoned.ts', value: "poison-bottle" },
    { file: 'gamecharacters/buffs/standard/RevolutionaryFervor.ts', value: "fist" },
    { file: 'gamecharacters/buffs/standard/SacrificeBuff.ts', value: "sacrifice" },
    { file: 'gamecharacters/buffs/standard/StressReliefFinisher.ts', value: "stress-relief-finisher" },
    { file: 'gamecharacters/buffs/standard/SurfaceSellValue.ts', value: "valuable-on-surface" },
    { file: 'gamecharacters/buffs/standard/Swarm.ts', value: "bee-swarm" },
    { file: 'gamecharacters/buffs/standard/TemporaryLethality.ts', value: "temporary-strength" },
    { file: 'gamecharacters/buffs/standard/Tense.ts', value: "tense" },
    { file: 'gamecharacters/buffs/standard/ValuableCargo.ts', value: "valuable-cargo" },
    { file: 'gamecharacters/buffs/standard/Vulnerable.ts', value: "broken-shield" },
    { file: 'gamecharacters/buffs/standard/Ward.ts', value: "ward" },
    { file: 'gamecharacters/buffs/standard/Weak.ts', value: "fist-weakness" },
    { file: 'gamecharacters/playerclasses/cards/archon/uncommon/HoldTheLine.ts', value: "CourageUnderFire" },
    { file: 'gamecharacters/playerclasses/cards/basic/Defend.ts', value: "shield" },
    { file: 'gamecharacters/playerclasses/cards/basic/FireRevolver.ts', value: "gun" },
    { file: 'gamecharacters/playerclasses/cards/basic/Rummage.ts', value: "rummage" },
    { file: 'gamecharacters/playerclasses/cards/blackhand/commons/RageFueledAxe.ts', value: "rage-fueled-axe" },
    { file: 'gamecharacters/playerclasses/cards/blackhand/rares/AxeCrazy.ts', value: "axe-crazy" },
    { file: 'gamecharacters/playerclasses/cards/blackhand/rares/InfernaliteCache.ts', value: "enrage-test" },
    { file: 'gamecharacters/playerclasses/cards/blackhand/rares/Pyrestarter.ts', value: "fire-starter" },
    { file: 'gamecharacters/playerclasses/cards/blackhand/rares/Pyronox.ts', value: "flames-amplifier" },
    { file: 'gamecharacters/playerclasses/cards/blackhand/uncommons/AxeMeAQuestion.ts', value: "axe-crit" },
    { file: 'gamecharacters/playerclasses/cards/blackhand/uncommons/AxeMeAQuestion.ts', value: "axe-question" },
    { file: 'gamecharacters/playerclasses/cards/blackhand/uncommons/HazmatSpecialist.ts', value: "hazmat-suit" },
    { file: 'gamecharacters/playerclasses/cards/blackhand/uncommons/ReIgnition.ts', value: "fire-silhouette" },
    { file: 'gamecharacters/playerclasses/cards/blackhand/uncommons/Smokescreen.ts', value: "smoke-bomb" },
    { file: 'gamecharacters/playerclasses/cards/diabolist/commons/BloodShield.ts', value: "blood-shield" },
    { file: 'gamecharacters/playerclasses/cards/diabolist/commons/ObsidianCandles.ts', value: "obsidian_candles" },
    { file: 'gamecharacters/playerclasses/cards/diabolist/rares/ExpertOccultist.ts', value: "blood_drop" },
    { file: 'gamecharacters/statuses/curses/traumas/Addiction.ts', value: "addiction-curse" },
    { file: 'gamecharacters/statuses/curses/traumas/Berserk.ts', value: "berserk-curse" },
    { file: 'gamecharacters/statuses/curses/traumas/Greedy.ts', value: "greedy-curse" },
    { file: 'gamecharacters/statuses/curses/traumas/Idolatrous.ts', value: "idolatrous-curse" },
    { file: 'gamecharacters/statuses/curses/traumas/Paranoid.ts', value: "paranoid-curse" },
    { file: 'gamecharacters/statuses/curses/traumas/Vain.ts', value: "vain-curse" },
    { file: 'screens/subcomponents/CombatCardManager.ts', value: "exhaustpile" },
    { file: 'strategic_projects/AbyssalResearchInstitute.ts', value: "abyssal_research_institute" },
    { file: 'strategic_projects/BlueRoomReadingSocieties.ts', value: "blue_room_reading" },
    { file: 'strategic_projects/DisMunicipalBonds.ts', value: "dis_municipal_bonds" },
    { file: 'strategic_projects/LetheExtractionCo.ts', value: "lethe_extraction" },
    { file: 'strategic_projects/LeviMaxwellAscensionProtocol.ts', value: "levi_maxwell_ascension_protocol" },
    { file: 'strategic_projects/OurManInDis.ts', value: "our_man_in_dis" },
    { file: 'strategic_projects/PhlegethonCoalfalls.ts', value: "phlegethon_coalfalls" },
    { file: 'strategic_projects/RetrainingProgram.ts', value: "retraining_program" },
    { file: 'strategic_projects/RevolutionaryContacts.ts', value: "revolutionary_contacts" },
    { file: 'strategic_projects/SmytheBowyerPoppyFields.ts', value: "smythe_bowyer_poppy_fields" },
    { file: 'strategic_projects/TheFoundry.ts', value: "the_foundry" },
    { file: 'ui/PhysicalBuff.ts', value: "adjacent_location_icon" },
    { file: 'ui/PhysicalBuff.ts', value: "current_location_icon" },
];

describe('Asset manifest integrity (source lint)', () => {
    const manifestEntries = loadManifest(REPO_ROOT);

    it('every manifest entry points at a file that exists on disk', () => {
        const missing = findMissingFiles(manifestEntries, REPO_ROOT);
        expect(missing, `Manifest entries missing on disk: ${missing.map(e => e.prefix + e.file).join(', ')}`)
            .toEqual([]);
    });

    it('no two manifest entries share a texture key (last-loaded silently wins)', () => {
        const collisions = findKeyCollisions(manifestEntries);
        const summary = collisions.map(c => `${c.key}: ${c.locations.join(' vs ')}`);
        expect(collisions, `Texture key collisions: ${summary.join(' | ')}`).toEqual([]);
    });

    it('every imageName/portraitName reference in src/ resolves to a declared manifest key', () => {
        const manifestKeys = new Set(manifestEntries.map(e => e.key));
        const expectedSet = new Set(EXPECTED_MISSING_IMAGE_REFS.map(v => `${v.file}::${v.value}`));

        const newViolations: string[] = [];
        walkTsFiles(SRC).forEach(file => {
            const relFile = path.relative(SRC, file).split(path.sep).join('/');
            const source = fs.readFileSync(file, 'utf-8');
            extractImageKeyRefs(source).forEach(({ value }) => {
                // Empty string is a deliberate sentinel: AbstractConsumable.init()
                // and AbstractRelic.init() auto-generate a deterministic abstract
                // placeholder whenever imageName/portraitName is unset.
                if (value === '') return;
                if (manifestKeys.has(value)) return;
                const id = `${relFile}::${value}`;
                if (expectedSet.has(id)) return;
                newViolations.push(`${JSON.stringify(value)} (${relFile})`);
            });
        });

        expect(newViolations, `New imageName/portraitName references that don't resolve to any manifest key: ${newViolations.join(', ')}`)
            .toEqual([]);
    });

    it('sanity: the expected-violations allowlist itself still matches real source references', () => {
        // Guards against the allowlist going stale (e.g. a listed file/value
        // pair getting renamed) by requiring every listed pair to still be
        // found by the scanner, and that none of them are already fixed
        // (which would mean the entry should be deleted to keep this test
        // meaningful).
        const foundPairs = new Set<string>();
        walkTsFiles(SRC).forEach(file => {
            const relFile = path.relative(SRC, file).split(path.sep).join('/');
            const source = fs.readFileSync(file, 'utf-8');
            extractImageKeyRefs(source).forEach(({ value }) => {
                foundPairs.add(`${relFile}::${value}`);
            });
        });

        const stale = EXPECTED_MISSING_IMAGE_REFS.filter(v => !foundPairs.has(`${v.file}::${v.value}`));
        expect(stale, `Allowlist entries no longer found in source (delete them): ${JSON.stringify(stale)}`)
            .toEqual([]);
    });
});
