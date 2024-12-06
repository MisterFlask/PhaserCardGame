import { AbstractRelic } from './AbstractRelic';
import { CaskOfErrantSouls } from './common/CaskOfErrantSouls';
import { Catspaw } from './common/Catspaw';
import { FrozenDew } from './common/FrozenDew';
import { GlassCross } from './common/GlassCross';
import { HopeCandle } from './common/HopeCandle';
import { IronFilings } from './common/IronFilings';
import { MistBottle } from './common/MistBottle';
import { TornPage } from './common/TornPage';
import { VialOfBlood } from './common/VialOfBlood';

export class RelicsLibrary {
    private static instance: RelicsLibrary;
    private relics: AbstractRelic[];

    private constructor() {
        this.relics = [
            new Catspaw(),
            new HopeCandle(),
            new TornPage(),
            new MistBottle(),
            new FrozenDew(),
            new IronFilings(),
            new GlassCross(),
            new CaskOfErrantSouls(),
            new VialOfBlood()
        ];
    }

    public static getInstance(): RelicsLibrary {
        if (!RelicsLibrary.instance) {
            RelicsLibrary.instance = new RelicsLibrary();
        }
        return RelicsLibrary.instance;
    }

    public getAllRelics(): AbstractRelic[] {
        var relics = this.relics;
        relics.forEach(relic => relic.init());
        return relics.map(relic => relic.copy());
    }

    public getRandomRelics(count: number): AbstractRelic[] {
        var relics = this.relics
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .map(relic => relic.copy());
        relics.forEach(relic => relic.init());
        return relics;
    }
}
