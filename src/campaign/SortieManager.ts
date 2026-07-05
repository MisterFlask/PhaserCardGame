import { EncounterManager } from "../encounters/EncounterManager";
import { PlayerCharacter } from "../gamecharacters/PlayerCharacter";
import { AbstractReward } from "../rewards/AbstractReward";
import { CardReward } from "../rewards/CardReward";
import { CardRewardsGenerator } from "../rules/CardRewardsGenerator";
import { GameState } from "../rules/GameState";
import { CampaignUiState } from "../screens/campaign/hq_ux/CampaignUiState";
import { SceneChanger } from "../screens/SceneChanger";
import { Contract } from "./Contract";
import { applyCasualties } from "./SortieResolution";

/**
 * Runs a contract sortie: a fixed sequence of 1-2 combats with no node map.
 * HP persists across combats within the sortie. On resolution: payout to the
 * vault, wounds/deaths applied to the roster, campaign time advances.
 */
export class SortieManager {
    private static instance: SortieManager;
    public static getInstance(): SortieManager {
        if (!SortieManager.instance) {
            SortieManager.instance = new SortieManager();
        }
        return SortieManager.instance;
    }
    private constructor() {}

    public activeContract: Contract | null = null;
    public squad: PlayerCharacter[] = [];
    public combatsCompleted: number = 0;
    /** Set at resolution so the HQ can show a report. */
    public lastSortieReport: string[] = [];

    public isActive(): boolean {
        return this.activeContract !== null;
    }

    public combatsRemaining(): number {
        return this.activeContract ? this.activeContract.numCombats - this.combatsCompleted : 0;
    }

    public startSortie(contract: Contract, squad: PlayerCharacter[]): void {
        const gameState = GameState.getInstance();

        this.activeContract = contract;
        this.squad = squad;
        this.combatsCompleted = 0;
        this.lastSortieReport = [];

        // Contract accepted: off the board.
        const campaign = CampaignUiState.getInstance();
        campaign.availableContracts = campaign.availableContracts.filter(c => c.id !== contract.id);
        campaign.selectedContract = null;

        // The squad deployed rested; within the sortie HP carries between combats.
        squad.forEach(character => {
            character.hitpoints = character.maxHitpoints;
        });

        gameState.currentRunCharacters = squad;
        gameState.initializeRun();
        gameState.currentAct = contract.act;

        this.launchNextCombat();
    }

    public launchNextCombat(): void {
        if (!this.activeContract) return;
        const encounter = EncounterManager.getInstance()
            .getRandomCombatEncounter(this.activeContract.act, this.activeContract.segment);
        SceneChanger.switchToCombatScene(encounter);
    }

    /** Card pick after every combat; the contract's £ settles at resolution. */
    public getRewardsForCurrentCombat(): AbstractReward[] {
        const cards = CardRewardsGenerator.getInstance().generateCardRewardsForCombat();
        return [new CardReward(cards)];
    }

    /** Called when the player clicks Continue/Return after a won combat. */
    public advance(): void {
        if (!this.activeContract) return;
        this.combatsCompleted++;
        if (this.combatsRemaining() > 0) {
            this.launchNextCombat();
        } else {
            this.resolveSortie();
        }
    }

    /** The whole squad went down: no payout, the roster pays the price. */
    public handleSquadWipe(): void {
        if (!this.activeContract) return;
        const contract = this.activeContract;
        const campaign = CampaignUiState.getInstance();
        const report: string[] = [
            `Contract "${contract.name}" FAILED. The squad did not return.`
        ];

        this.squad.forEach(character => {
            character.isDeceased = true;
            campaign.roster = campaign.roster.filter(c => c !== character);
            report.push(`${character.name}: lost in the field.`);
        });

        GameState.getInstance().currentRunCharacters = [];
        campaign.selectedParty = [];
        this.activeContract = null;
        this.squad = [];
        this.combatsCompleted = 0;

        campaign.advanceWeeks(contract.durationWeeks);
        this.lastSortieReport = report;

        SceneChanger.switchToCampaignScene();
    }

    private resolveSortie(): void {
        const contract = this.activeContract!;
        const gameState = GameState.getInstance();
        const campaign = CampaignUiState.getInstance();
        const report: string[] = [];

        gameState.moneyInVault += contract.payout;
        campaign.contractsCompleted++;
        report.push(`Contract "${contract.name}" fulfilled: £${contract.payout} banked.`);

        // Time passes first (the sortie took this long); wounds sustained on
        // this sortie are applied after, so they don't tick during it.
        campaign.advanceWeeks(contract.durationWeeks);

        // Casualties and wounds come home with the squad.
        const casualties = applyCasualties(this.squad);
        casualties.deaths.forEach(dead => {
            campaign.roster = campaign.roster.filter(c => c !== dead);
        });
        report.push(...casualties.lines);

        // Decks persist between sorties by design; only combat-scoped state clears.
        this.squad.forEach(character => {
            character.buffs = character.buffs.filter(buff => buff.isPersonaTrait);
        });
        gameState.currentRunCharacters = [];
        campaign.selectedParty = [];

        this.activeContract = null;
        this.squad = [];
        this.combatsCompleted = 0;

        this.lastSortieReport = [...report, ...campaign.calendar.boardEvents
            .filter(e => e.week > campaign.calendar.week - contract.durationWeeks)
            .map(e => e.message)];

        SceneChanger.switchToCampaignScene();
    }
}
