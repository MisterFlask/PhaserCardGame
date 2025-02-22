import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { AdditionalHellCurrency } from "../gamecharacters/buffs/location/AdditionalHellCurrency";
import { AdditionalPromissoryNotes } from "../gamecharacters/buffs/location/AdditionalPromissoryNotes";
import { AnotherCardReward } from "../gamecharacters/buffs/location/AnotherCardReward";
import { EldritchFoes } from "../gamecharacters/buffs/location/EldritchFoes";
import { GuaranteedRareCardReward } from "../gamecharacters/buffs/location/GuaranteedRareCardReward";
import { GuaranteedRelic } from "../gamecharacters/buffs/location/GuaranteedRelic";
import { TrappedLocation } from "../gamecharacters/buffs/location/RockSlides";
import { TougherEnemies } from "../gamecharacters/buffs/location/TougherEnemies";
import { UpgradedCardReward } from "../gamecharacters/buffs/location/UpgradedCardReward";
import { DrainCombatResource } from "../gamecharacters/buffs/standard/combatresource/detrimental/DrainCombatResource";
import { SorrowMothsModifier } from "../rules/acts/location/SorrowMoths";
import { CombatResources, GameState } from "../rules/GameState";

export class LocationBuffRegistry {
    private static instance: LocationBuffRegistry;
    private availableNegativeBuffs: AbstractBuff[] = [];
    private availablePositiveBuffs: AbstractBuff[] = [];
    treasureNegativeBuffs: TrappedLocation[];

    private get combatResources(): CombatResources {
        return GameState.getInstance().combatState.combatResources;
    }

    private constructor() {
        this.availableNegativeBuffs = [
            new EldritchFoes(),
            new TrappedLocation(4),
            new TougherEnemies(),
            new SorrowMothsModifier(2),
            new DrainCombatResource(this.combatResources.mettle, 1),
            new DrainCombatResource(this.combatResources.blood, 1),
            new DrainCombatResource(this.combatResources.venture, 1),
            new DrainCombatResource(this.combatResources.ashes, 1),
            new DrainCombatResource(this.combatResources.smog, 1),
        ];

        // positive buffs: another card reward, upgraded card rewards, guaranteed rare card reward, additional hell currency, additional promissory notes, guaranteed relic
        this.availablePositiveBuffs = [
            new AnotherCardReward(),
            new UpgradedCardReward(),
            new GuaranteedRareCardReward(),
            new AdditionalHellCurrency(25),
            new AdditionalPromissoryNotes(25),
            new GuaranteedRelic(),
        ];

        this.treasureNegativeBuffs = [
            new TrappedLocation(4),
        ];
    }

    public static getInstance(): LocationBuffRegistry {
        if (!LocationBuffRegistry.instance) {
            LocationBuffRegistry.instance = new LocationBuffRegistry();
        }
        return LocationBuffRegistry.instance;
    }

    public getAvailablePositiveBuffs(): AbstractBuff[] {
        return this.availablePositiveBuffs;
    }

    public getAvailableNegativeBuffs(): AbstractBuff[] {
        return this.availableNegativeBuffs;
    }

    public getTreasureNegativeBuffs(): TrappedLocation[] {
        return this.treasureNegativeBuffs;
    }
}
