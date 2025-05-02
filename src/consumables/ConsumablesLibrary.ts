import { AbstractConsumable } from "./AbstractConsumable";
import { BloodPriceAuthorization } from "./BloodPriceAuthorization";
import { CombatPerformanceAppraisal } from "./CombatPerformanceAppraisal";
import { DamageMitigationFiling } from "./DamageMitigationFiling";
import { EmergencyCardDraw } from "./EmergencyCardDraw";
import { GrowthThroughSuffering } from "./GrowthThroughSuffering";
import { HealthPotion } from "./HealthPotion";
import { OvertimeAuthorization } from "./OvertimeAuthorization";
import { RequisitionOfSupplementalVigor } from "./RequisitionOfSupplementalVigor";
import { SoulHarvestingPermit } from "./SoulHarvestingPermit";
import { StrengthElixir } from "./StrengthElixir";
import { TacticalAssessmentForm } from "./TacticalAssessmentForm";
import { TemporaryEmpowermentPermit } from "./TemporaryEmpowermentPermit";
import { VentureCapitalAuthorization } from "./VentureCapitalAuthorization";

/**
 * Library for managing all consumables in the game
 */
export class ConsumablesLibrary {
    private static instance: ConsumablesLibrary;
    
    private consumableConstructors: (new () => AbstractConsumable)[] = [
        HealthPotion,
        StrengthElixir,
        // Add more consumables here as they're implemented
        OvertimeAuthorization,
        RequisitionOfSupplementalVigor,
        EmergencyCardDraw,
        DamageMitigationFiling,
        TemporaryEmpowermentPermit,
        CombatPerformanceAppraisal,
        SoulHarvestingPermit,
        TacticalAssessmentForm,
        BloodPriceAuthorization,
        GrowthThroughSuffering,
        VentureCapitalAuthorization
    
        /**
         * To be added:
         * | form | effect | micro-flavor |
|------|--------|--------------|
| **form 17-b: overtime authorization** | gain 2 energy immediately | "mandatory enthusiasm enforced." |
| **form 256-f: requisition of supplemental vigor** | heal 15 hp | "officially sanctioned second wind." |
| **form 42-a: duplication request** | duplicate next card played | "see also: redundancy, redundancy." |
| **form 99-x: application for emergency card draw** | draw 3 cards | "must be completed in panic." |
| **form 404-z: damage mitigation filing** | gain 12 block | "if form not found, damage not mitigated." |
| **form 1-aa: temporary empowerment permit** | gain 2 lethality this turn | "valid until revoked mid-combat." |
| **form 3-c: combat performance appraisal** | upgrade all cards in hand this combat | "you've exceeded expectations—adjusting expectations." |
| **form 808-e: intangible asset declaration** | gain 1 intangible this turn | "property of infernal asset management." |
         */

    ];



    /**
     * Get the singleton instance of ConsumablesLibrary
     */
    public static getInstance(): ConsumablesLibrary {
        if (!ConsumablesLibrary.instance) {
            ConsumablesLibrary.instance = new ConsumablesLibrary();
        }
        return ConsumablesLibrary.instance;
    }

    /**
     * Get all available consumables
     */
    public getAllConsumables(): AbstractConsumable[] {
        return this.consumableConstructors.map(constructor => {
            const consumable = new constructor();
            consumable.init();
            return consumable;
        });
    }

    /**
     * Get a random selection of consumables for shop
     * @param count Number of consumables to return
     */
    public getRandomConsumablesForShop(count: number): AbstractConsumable[] {
        // Get all consumables
        const allConsumables = this.getAllConsumables();
        
        // Shuffle and take the requested number
        return this.shuffleArray(allConsumables).slice(0, Math.min(count, allConsumables.length));
    }

    /**
     * Get a specific consumable by name
     * @param name Name of the consumable to retrieve
     */
    public getConsumableByName(name: string): AbstractConsumable | undefined {
        const allConsumables = this.getAllConsumables();
        return allConsumables.find(consumable => consumable.getDisplayName() === name);
    }

    /**
     * Helper function to shuffle an array
     */
    private shuffleArray<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
} 