import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { PlayerCharacter } from "../gamecharacters/PlayerCharacter";
import { GameState } from "../rules/GameState";
import { CampaignUiState } from "../screens/campaign/hq_ux/CampaignUiState";
import { calendarFromDTO, calendarToDTO, contractFromDTO, contractToDTO } from "./PureDTOConversions";
import {
    BuffDTO, CampaignSave, CardDTO, CharacterDTO,
    SAVE_FORMAT_VERSION
} from "./SaveDTOs";
import { SaveRegistries } from "./SaveRegistries";

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
            traits: character.buffs.filter(b => b.isPersonaTrait).map(b => this.buffToDTO(b)),
            deck: character.cardsInMasterDeck.map(c => this.cardToDTO(c)),
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
            ownedProjects: campaign.ownedStrategicProjects.map(p => ({
                name: p.name,
                victoryPoints: p.getVictoryPoints(),
            })),
            roster: campaign.roster.map(c => this.characterToDTO(c)),
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

    /** Overwrites the live singletons with the saved campaign. HQ-scope only. */
    public static applySave(save: CampaignSave): void {
        const campaign = CampaignUiState.getInstance();
        const gameState = GameState.getInstance();

        gameState.moneyInVault = save.moneyInVault;
        campaign.calendar = calendarFromDTO(save.calendar);
        campaign.availableContracts = save.contracts.map(contractFromDTO);
        campaign.contractsCompleted = save.contractsCompleted;
        campaign.selectedContract = null;
        campaign.selectedParty = [];
        // Match by name against the canonical instances so instance-identity
        // checks in the investment UI keep working. Purchasing moves a project
        // from available to owned, so the loader mirrors that split.
        const ownedByName = new Map(save.ownedProjects.map(p => [p.name, p]));
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
    }
}
