import { AbstractRelic } from './AbstractRelic';
import { CaskOfErrantSouls } from './common/CaskOfErrantSouls';
import { Catspaw } from './common/Catspaw';
import { FrozenDew } from './common/FrozenDew';
import { GlassCross } from './common/GlassCross';
import { HopeCandle } from './common/HopeCandle';
import { VialOfBlood } from './common/VialOfBlood';
import { IronFilings } from './common/IronFilings';
import { MistBottle } from './common/MistBottle';
import { TornPage } from './common/TornPage';

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
        return this.relics;
    }

    public getRandomRelics(count: number): AbstractRelic[] {
        var relics = this.relics.sort(() => Math.random() - 0.5).slice(0, count);
        relics.forEach(relic => relic.init());
        return relics;
    }
}
