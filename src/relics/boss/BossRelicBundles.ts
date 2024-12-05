import { BasicEnergyRelic } from "./BasicEnergyRelic";
import { DaintyGloves } from "./DaintyGloves";

export class BossRelicBundles {
    static readonly BASIC_ENERGY_RELIC = new BasicEnergyRelic();
    static readonly DAINTY_GLOVES = new DaintyGloves();

    static readonly ALL_BOSS_RELIC_BUNDLES = [
        BossRelicBundles.BASIC_ENERGY_RELIC,
        BossRelicBundles.DAINTY_GLOVES
    ];
}
