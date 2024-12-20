import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { EldritchFoes } from "../gamecharacters/buffs/location/EldritchFoes";
import { RockSlides } from "../gamecharacters/buffs/location/RockSlides";
import { TougherEnemies } from "../gamecharacters/buffs/location/TougherEnemies";
import { DrainCombatResource } from "../gamecharacters/buffs/standard/combatresource/detrimental/DrainCombatResource";
import { CombatResources, GameState } from "../rules/GameState";

export class LocationBuffRegistry {
    private static instance: LocationBuffRegistry;
    private availableNegativeBuffs: AbstractBuff[] = [];
    private availablePositiveBuffs: AbstractBuff[] = [];

    private get combatResources(): CombatResources {
        return GameState.getInstance().combatState.combatResources;
    }

    private constructor() {
        this.availableNegativeBuffs = [
            new EldritchFoes(),
            new RockSlides(),
            new TougherEnemies(),

            new DrainCombatResource(this.combatResources.mettle, 1),
        ];

        // positive buffs: another card reward, upgraded card rewards, guaranteed rare card reward, additional hell currency, additional promissory notes, guaranteed relic
        this.availablePositiveBuffs = [
            new AnotherCardReward(),
            new UpgradedCardReward(),
            new GuaranteedRareCardReward(),
            new AdditionalHellCurrency(),
            new AdditionalPromissoryNotes(),
            new GuaranteedRelic(),
        ];
    }



    public static getInstance(): LocationBuffRegistry {
        if (!LocationBuffRegistry.instance) {
            LocationBuffRegistry.instance = new LocationBuffRegistry();
        }
        return LocationBuffRegistry.instance;
    }


}
