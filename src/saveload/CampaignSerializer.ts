import { StandingOrdersState } from "../campaign/orders/StandingOrdersState";
import { AbstractConsumable } from "../consumables/AbstractConsumable";
import { ConsumablesLibrary } from "../consumables/ConsumablesLibrary";
import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { PlayerCharacter } from "../gamecharacters/PlayerCharacter";
import { GameState } from "../rules/GameState";
import { CampaignUiState } from "../screens/campaign/hq_ux/CampaignUiState";
import {
    applyStandingOrdersDTO, calendarFromDTO, calendarToDTO, contractFromDTO, contractToDTO,
    standingOrdersToDTO
} from "./PureDTOConversions";
import {
    BuffDTO, CampaignSave, CardDTO, CharacterDTO, ConsumableDTO,
    SAVE_FORMAT_VERSION
} from "./SaveDTOs";
import { SaveRegistries } from "./SaveRegistries";
import { ABYSSAL_RESEARCH_INSTITUTE_LEGACY_PROJECT_NAME } from "../strategic_projects/StrategicProjectList";
import { ABYSSAL_RESEARCH_INSTITUTE_ORDER_ID } from "../campaign/orders/LaunchOrders";

/**
 * Converts campaign state to/from the plain-data save format. Only valid at
 * the HQ (between sorties): combat and sortie state are never serialized.
 */
export class CampaignSerializer {

    // ----- to save -----

    private static buffToDTO(buff: AbstractBuff): BuffDTO {
        return {
            className: buff.constructor.name,
            stacks: buff.stacks,
            hidden: buff.moveToMainDescription === true,
        };
    }

    private static cardToDTO(card: PlayableCard): CardDTO {
        return {
            className: card.constructor.name,
            displayName: card.name,
            buffs: card.buffs.map(b => this.buffToDTO(b)),
            baseDamage: card.baseDamage,
            baseBlock: card.baseBlock,
            baseEnergyCost: card.baseEnergyCost,
            baseMagicNumber: card.baseMagicNumber,
        };
    }

    private static characterToDTO(character: PlayerCharacter): CharacterDTO {
        return {
            name: character.name,
            portraitName: character.portraitName,
            className: character.characterClass.name,
            maxHitpoints: character.maxHitpoints,
            weeksWoundedRemaining: character.weeksWoundedRemaining,
            // Persona traits plus campaign-persistent afflictions (stress).
            // Perks (PerkPools.ts) are isPersonaTrait too, so they ride this
            // same filter without any perk-specific DTO work.
            traits: character.buffs
                .filter(b => b.isPersonaTrait || b.id === "stress")
                .map(b => this.buffToDTO(b)),
            deck: character.cardsInMasterDeck.map(c => this.cardToDTO(c)),
            xp: character.xp,
            level: character.level,
        };
    }

    private static consumableToDTO(consumable: AbstractConsumable): ConsumableDTO {
        return {
            name: consumable.getDisplayName(),
            usesLeft: consumable.uses,
        };
    }

    public static toSave(): CampaignSave {
        const campaign = CampaignUiState.getInstance();
        const gameState = GameState.getInstance();
        const cal = campaign.calendar;

        return {
            version: SAVE_FORMAT_VERSION,
            savedAtIso: new Date().toISOString(),
            moneyInVault: gameState.moneyInVault,
            calendar: calendarToDTO(cal),
            contracts: campaign.availableContracts.map(contractToDTO),
            contractsCompleted: campaign.contractsCompleted,
            contractsCompletedByClient: { ...campaign.contractsCompletedByClient },
            ownedProjects: campaign.ownedStrategicProjects.map(p => ({
                name: p.name,
                victoryPoints: p.getVictoryPoints(),
            })),
            roster: campaign.roster.map(c => this.characterToDTO(c)),
            recruitCandidates: campaign.recruitCandidates.map(c => this.characterToDTO(c)),
            standingOrders: standingOrdersToDTO(StandingOrdersState.getInstance()),
            consumables: campaign.consumables.map(c => this.consumableToDTO(c)),
        };
    }

    // ----- from save -----

    private static buffsFromDTOs(dtos: BuffDTO[]): AbstractBuff[] {
        const buffs: AbstractBuff[] = [];
        dtos.forEach(dto => {
            const buff = SaveRegistries.createBuff(dto.className, dto.stacks);
            if (buff) {
                if (dto.hidden) buff.moveToMainDescription = true;
                buffs.push(buff);
            }
        });
        return buffs;
    }

    private static cardFromDTO(dto: CardDTO): PlayableCard | null {
        const card = SaveRegistries.createCard(dto.className);
        if (!card) return null;
        card.name = dto.displayName;
        card.baseDamage = dto.baseDamage;
        card.baseBlock = dto.baseBlock;
        card.baseEnergyCost = dto.baseEnergyCost;
        card.baseMagicNumber = dto.baseMagicNumber;

        // Merge buffs rather than replace: the constructor already installed
        // the card's intrinsic buffs (Exhaust, Ethereal, sell values...) with
        // correct wiring, so those only need their stacks synced. Only buffs
        // added after construction (reward modifiers, starting-deck rolls)
        // are reconstructed through the registry.
        dto.buffs.forEach(buffDto => {
            const existing = card.buffs.find(b => b.constructor.name === buffDto.className);
            if (existing) {
                existing.stacks = buffDto.stacks;
                if (buffDto.hidden) existing.moveToMainDescription = true;
            } else {
                const rebuilt = SaveRegistries.createBuff(buffDto.className, buffDto.stacks);
                if (rebuilt) {
                    if (buffDto.hidden) rebuilt.moveToMainDescription = true;
                    card.buffs.push(rebuilt);
                }
            }
        });
        return card;
    }

    private static characterFromDTO(dto: CharacterDTO): PlayerCharacter | null {
        const characterClass = SaveRegistries.createCharacterClass(dto.className);
        if (!characterClass) return null;
        characterClass.initialize();

        const character = new PlayerCharacter({
            name: dto.name,
            portraitName: dto.portraitName,
            characterClass,
        });
        character.maxHitpoints = dto.maxHitpoints;
        character.hitpoints = dto.maxHitpoints; // at HQ, soldiers are rested
        character.weeksWoundedRemaining = dto.weeksWoundedRemaining;
        character.xp = dto.xp;
        character.level = dto.level;
        character.buffs = this.buffsFromDTOs(dto.traits);

        character.cardsInMasterDeck = [];
        dto.deck.forEach(cardDto => {
            const card = this.cardFromDTO(cardDto);
            if (card) {
                card.owningCharacter = character;
                character.cardsInMasterDeck.push(card);
            }
        });
        character.startingDeck = character.cardsInMasterDeck.map(c => c.Copy());
        return character;
    }

    private static consumableFromDTO(dto: ConsumableDTO): AbstractConsumable | null {
        const consumable = ConsumablesLibrary.getInstance().getConsumableByName(dto.name);
        if (!consumable) {
            console.warn(`CampaignSerializer: unknown consumable "${dto.name}" in save, dropping`);
            return null;
        }
        consumable.uses = dto.usesLeft;
        return consumable;
    }

    /** Overwrites the live singletons with the saved campaign. HQ-scope only. */
    public static applySave(save: CampaignSave): void {
        const campaign = CampaignUiState.getInstance();
        const gameState = GameState.getInstance();

        gameState.moneyInVault = save.moneyInVault;
        campaign.calendar = calendarFromDTO(save.calendar);
        campaign.availableContracts = save.contracts.map(contractFromDTO);
        campaign.contractsCompleted = save.contractsCompleted;
        campaign.contractsCompletedByClient = { ...(save.contractsCompletedByClient ?? {}) };
        campaign.selectedContract = null;
        campaign.selectedParty = [];
        // Abyssal Research Institute migration: it shipped as a Capital Work
        // and converted to a Standing Order (see LaunchOrders.ts's
        // AbyssalResearchInstituteOrder / strategic_layer_redesign.md's
        // Standing Orders amendment). A save from before the conversion may
        // still list it in ownedProjects; ALL_STRATEGIC_PROJECTS keeps the
        // class around for exactly this case, but it's no longer in
        // availableStrategicProjects (PURCHASABLE_STRATEGIC_PROJECTS
        // excludes it), so it must be handled before the generic name-match
        // below rather than falling through it.
        //
        // NOTE ON REACHABILITY: SaveManager.loadOnceOnBoot rejects any save
        // whose version !== SAVE_FORMAT_VERSION wholesale (no migration
        // chain exists anywhere in this codebase — every prior version bump,
        // v2 through v8, relied on the same "mismatched version = start
        // fresh" behavior). That means a real pre-v9 save with ARI still
        // owned never actually reaches this method via the normal boot path;
        // it gets discarded before CampaignSerializer.applySave is called at
        // all, same as any other save-shape change. This logic exists anyway
        // because applySave is unit-tested directly (bypassing the version
        // gate) and because "handle a save that already owns it as a
        // project" is cheap, correct, and future-proofs the method if the
        // version gate is ever relaxed to a real migration chain. Simplest-
        // correct approach: drop the legacy Capital Work entirely and enact
        // the equivalent order in its place, best-effort (if a slot is
        // free); if every slot is already taken, the effect lapses but a
        // board note explains why rather than silently losing it.
        const ownedProjectDTOs = save.ownedProjects
            .filter(p => p.name !== ABYSSAL_RESEARCH_INSTITUTE_LEGACY_PROJECT_NAME);
        const hadLegacyAri = ownedProjectDTOs.length !== save.ownedProjects.length;

        // Match by name against the canonical instances so instance-identity
        // checks in the investment UI keep working. Purchasing moves a project
        // from available to owned, so the loader mirrors that split.
        const ownedByName = new Map(ownedProjectDTOs.map(p => [p.name, p]));
        const allProjects = [
            ...campaign.availableStrategicProjects,
            ...campaign.ownedStrategicProjects,
        ];
        campaign.ownedStrategicProjects = allProjects
            .filter(p => ownedByName.has(p.name));
        campaign.ownedStrategicProjects.forEach(p => {
            p.victoryPoints = ownedByName.get(p.name)!.victoryPoints;
        });
        campaign.availableStrategicProjects = allProjects
            .filter(p => !ownedByName.has(p.name));
        campaign.roster = save.roster
            .map(c => this.characterFromDTO(c))
            .filter((c): c is PlayerCharacter => c !== null);
        campaign.recruitCandidates = save.recruitCandidates
            .map(c => this.characterFromDTO(c))
            .filter((c): c is PlayerCharacter => c !== null);
        campaign.consumables = save.consumables
            .map(c => this.consumableFromDTO(c))
            .filter((c): c is AbstractConsumable => c !== null);

        applyStandingOrdersDTO(StandingOrdersState.getInstance(), save.standingOrders);
        campaign.syncStandingOrderBonusSlots();

        if (hadLegacyAri) {
            const ordersState = StandingOrdersState.getInstance();
            const alreadyActive = ordersState.activeOrderIds.includes(ABYSSAL_RESEARCH_INSTITUTE_ORDER_ID);
            const migrated = alreadyActive
                || ordersState.enact(ABYSSAL_RESEARCH_INSTITUTE_ORDER_ID, campaign.calendar.year);
            campaign.calendar.boardEvents.push({
                week: campaign.calendar.week,
                message: migrated
                    ? "Notice: the Abyssal Research Institute's charter has been reissued as a Standing Order; its research grant continues uninterrupted."
                    : "Notice: the Abyssal Research Institute's charter has lapsed pending a free Standing Order slot; ratify it at the next board meeting to resume its grant.",
                isWarning: !migrated,
            });
        }
    }
}
