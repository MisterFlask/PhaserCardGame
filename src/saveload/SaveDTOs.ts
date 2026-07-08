// Plain-data save format for at-HQ campaign persistence. No class instances,
// no Phaser types — everything here must survive JSON.stringify/parse.
// Class instances are reconstructed via SaveRegistries.

// v2: added contractsCompleted and per-project victory points.
// v3: added contract client and paymentClause (invoice-style flavor fields).
// v4: added standingOrders (active/pending order ids + bonus slots).
// v5: added per-character xp/level (Amendment: Soldier Levels & Promotions).
//     Perks ride the existing `traits` buff serialization (isPersonaTrait);
//     no new DTO shape needed for them.
// v6: added consumables (campaign-owned consumable stock; the per-sortie
//     loadout on GameState never serializes) and Contract.consumableRewardName.
// v7: added Contract.squadSize (2/3/4 muster requirement per contract).
// v8: added Contract.maxCrates and Contract.freightRatePerCrate (Trade Run
//     contracts). Contract.cratesLoaded deliberately does NOT serialize: it
//     is chosen at dispatch, and a sortie is never mid-flight in a save
//     (saves are HQ-only, house rule 4), so a contract sitting on the board
//     always has cratesLoaded 0 and never needs to survive a reload.
// v9: added contractsCompletedByClient (per-client completion counts, for
//     client-unlocked retainer Standing Orders). Abyssal Research Institute
//     converted from a Capital Work to a Standing Order (no new DTO field —
//     StandingOrdersDTO.active already covers it; CampaignSerializer.applySave
//     migrates a legacy save's ownedProjects entry on load). Company
//     Secretariat (bonus Standing Order slot) is a Capital Work like any
//     other and needs no DTO change either (StandingOrdersDTO.bonusSlots is
//     re-synced from ownership on load, not read as ground truth from disk).
// v10: added recruitCandidates (Barracks hireable pool), closing a
//      save-scumming hole where reloading rerolled the recruits for free.
//      Reuses CharacterDTO/characterToDTO/characterFromDTO verbatim — same
//      shape as roster. Fresh-campaign value is an empty array;
//      CampaignUiState.ensureRecruitsPopulated() lazily tops it up to
//      RECRUIT_POOL_SIZE on next Barracks visit and never discards existing
//      entries, so a loaded non-empty pool survives untouched.
// v11: VP endgame pivot (src/docs/vp_endgame_design.md). Added
//      CampaignUiState.charterVictoryPoints (VP earned outside projects:
//      Prestige Commissions + Charter Buyback) and Contract.vpReward
//      (Prestige Commissions only; 0/undefined on every other contract
//      type). Fresh-campaign value for charterVictoryPoints is 0.
// v12: Relic equipment slots (src/docs/relic_equipment_design.md). Added
//      CampaignUiState.armoury (RelicDTO[]: the Company's owned, unassigned
//      relics) and CharacterDTO.equippedRelics/insuredRelicNames (a soldier's
//      slotted relics plus which of those are underwritten). RelicDTO
//      serializes by getDisplayName() (resolved through
//      RelicsLibrary.getRelicByName, mirroring ConsumableDTO) plus stacks
//      (every acquirable relic's only mutable state — see
//      RelicEquipment.test.ts's constructor-state lint). Fresh-campaign
//      value for armoury is a single EmergencyTeleporter (migrated from
//      GameState.relicsInventory's old run-scoped seed; see GameState.ts).
// v13: Staged Capital Works (src/docs/vp_endgame_design.md's Levi-Maxwell
//      Ascension Protocol capstone). OwnedProjectDTO gains optional
//      stagesPurchased/lastStagePurchaseWeek, read back onto
//      AbstractStrategicProject.stagesPurchased/lastStagePurchaseWeek by
//      CampaignSerializer.applySave. Both fields are optional and only
//      meaningful for a project with a `stages` ladder (currently only
//      Levi-Maxwell Ascension Protocol); every other owned project's DTO
//      omits them, same as today. Fresh-campaign value: n/a (ownedProjects
//      starts empty).
// v14: Capital Works Rebuild, Batch A (src/docs/strategic_layer_redesign.md's
//      amendment). Deleted The Foundry, Retraining Program, Dis Municipal
//      Bonds, Our Man In Dis, Lethe Extraction Co., and the four dead cargo
//      projects; added The Pattern Room, The Corrective Phrenology Wing, The
//      Cantonment Annexe, The Company Store, The Company Gazette. No DTO
//      shape change — the version bump alone is required because a save's
//      ownedProjects can name a now-deleted class (mismatched-version saves
//      are discarded and start fresh; established behavior, no migration
//      chain exists in this codebase).
// v15: Capital Works Rebuild, Batch B (contract-board Capital Works). Added
//      The Dis Legation and The Grand Trunk Extension; ContractDTO gains
//      optional exemptFromBoardSlots (true only on Legation commissions,
//      which sit outside the 5-slot public board — see
//      Contract.exemptFromBoardSlots / ContractGenerator.refillBoard).
export const SAVE_FORMAT_VERSION = 15;
export const SAVE_STORAGE_KEY = 'east-infernal-company-save';

export interface BuffDTO {
    /** Constructor name, resolved through the buff registry. */
    className: string;
    stacks: number;
    /** Mirrors AbstractBuff.moveToMainDescription (withoutShowingUpInBuffs). */
    hidden: boolean;
}

export interface CardDTO {
    /** Constructor name, resolved through the card registry. */
    className: string;
    /** Display name, which modifiers mutate (e.g. "Fire Revolver+🔮"). */
    displayName: string;
    buffs: BuffDTO[];
    // Numeric fields that card modifiers mutate in place.
    baseDamage: number;
    baseBlock: number;
    baseEnergyCost: number;
    baseMagicNumber: number;
}

export interface CharacterDTO {
    name: string;
    portraitName: string;
    /** BaseCharacterClass.name, resolved through the class registry. */
    className: string;
    maxHitpoints: number;
    weeksWoundedRemaining: number;
    traits: BuffDTO[];
    deck: CardDTO[];
    /** Cumulative XP; pending promotions are always derived (Leveling.ts), never stored. */
    xp: number;
    level: number;
    /** Relic equipment slots (src/docs/relic_equipment_design.md). Cap is
     *  Leveling.relicSlots(level); this array is not itself clamped on load
     *  (a save from before a level-down, if that ever existed, would just
     *  round-trip whatever it has). */
    equippedRelics: RelicDTO[];
    /** Display names (RelicDTO.name) of the subset of equippedRelics that
     *  has been underwritten (£40 one-time). Names, not indices, since
     *  array order isn't a stable identity. */
    insuredRelicNames: string[];
}

export interface RelicDTO {
    /** Display name, resolved through RelicsLibrary.getRelicByName. */
    name: string;
    /** Every acquirable relic's only mutable state (charge counters,
     *  stack-based bonuses) — see AbstractBuff.stacks and the constructor-
     *  state lint in RelicEquipment.test.ts. */
    stacks: number;
}

export interface ContractDTO {
    name: string;
    description: string;
    type: string;
    client: string;
    paymentClause: string;
    act: number;
    segment: number;
    difficultyStars: number;
    numCombats: number;
    deadlineWeeks: number;
    durationWeeks: number;
    payout: number;
    squadSize: number;
    regionName: string;
    consumableRewardName?: string;
    /** Trade Run only (0/absent on combat contracts). */
    maxCrates?: number;
    /** Trade Run only (0/absent on combat contracts). */
    freightRatePerCrate?: number;
    /** Prestige Commissions only (0/absent on every other contract type):
     *  Victory Points granted on completion instead of £ (payout is always 0
     *  on these). See src/docs/vp_endgame_design.md. */
    vpReward?: number;
    /** Legation commissions only (false/absent on every other contract):
     *  true when the contract doesn't occupy a public board slot — see
     *  Contract.exemptFromBoardSlots / ContractGenerator.refillBoard. */
    exemptFromBoardSlots?: boolean;
}

export interface ConsumableDTO {
    /** Display name, resolved through ConsumablesLibrary.getConsumableByName. */
    name: string;
    usesLeft: number;
}

export interface CalendarDTO {
    week: number;
    shareholderSatisfaction: number;
    currentDividendExpectation: number;
    boardEvents: { week: number; message: string; isWarning: boolean }[];
}

export interface OwnedProjectDTO {
    name: string;
    victoryPoints: number;
    /** Staged Capital Works only (AbstractStrategicProject.stages set) — see
     *  src/docs/vp_endgame_design.md. Absent/undefined on every non-staged
     *  owned project, same as today. */
    stagesPurchased?: number;
    /** Absolute campaign week the last stage was bought, paired with
     *  stagesPurchased above. */
    lastStagePurchaseWeek?: number;
}

export interface StandingOrdersDTO {
    active: string[];
    pending: string[] | null;
    bonusSlots: number;
}

export interface CampaignSave {
    version: number;
    savedAtIso: string;
    moneyInVault: number;
    calendar: CalendarDTO;
    contracts: ContractDTO[];
    contractsCompleted: number;
    /** Per-client completion counts (Contract.client -> count), driving
     *  client-unlocked retainer Standing Orders. */
    contractsCompletedByClient: Record<string, number>;
    /** Matched by name against the canonical project instances on load so
     *  instance-identity checks in the investment UI keep working. */
    ownedProjects: OwnedProjectDTO[];
    roster: CharacterDTO[];
    /** Barracks hireable pool (CampaignUiState.recruitCandidates). Same DTO
     *  shape as roster; kept as a separate field since it is a distinct list. */
    recruitCandidates: CharacterDTO[];
    standingOrders: StandingOrdersDTO;
    /** Campaign-owned consumable stock. The in-sortie loadout on
     *  GameState.consumables never serializes (saves are HQ-only). */
    consumables: ConsumableDTO[];
    /** VP earned outside strategic projects (Prestige Commissions, Charter
     *  Buyback). See src/docs/vp_endgame_design.md and
     *  CampaignUiState.charterVictoryPoints (the one owner of this fact). */
    charterVictoryPoints: number;
    /** The Company's owned, unassigned relics (src/docs/relic_equipment_design.md).
     *  The in-sortie loadout on GameState.relicsInventory never serializes
     *  (saves are HQ-only) — mirrors the `consumables` field's contract. */
    armoury: RelicDTO[];
}
