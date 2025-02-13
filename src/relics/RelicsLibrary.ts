import { PlayableCard } from '../gamecharacters/PlayableCard';
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
import { AkashicNewspaper } from './cursedcargo/AkashicNewspaper';
import { BloomOfSorrow } from './cursedcargo/BloomOfSorrow';
import { BomberGremlin } from './cursedcargo/BomberGremlin';
import { BurningCommissar } from './cursedcargo/cards/BurningCommissar';
import { ChairmanVizzerix } from './cursedcargo/cards/ChairmanVizzerix';
import { MawSculpture } from './cursedcargo/cards/MawSculpture';
import { TomeOfAvarice } from './cursedcargo/cards/TomeOfAvarice';
import { WatchfulClown } from './cursedcargo/cards/WatchfulClown';
import { DevouringIcon } from './cursedcargo/DevouringIcon';
import { GreedyParasite } from './cursedcargo/GreedyParasite';
import { OublietteFlower } from './cursedcargo/OublietteFlower';
import { ScreamingParasite } from './cursedcargo/ScreamingParasite';
import { SirenDaguerreotype } from './cursedcargo/SirenDaguerreotype';
import { SonorousKlaxon } from './cursedcargo/SonorousKlaxon';
import { WhisperOfSorrow } from './cursedcargo/WhisperOfSorrow';
import { WraithInABottle } from './cursedcargo/WraithInABottle';

export class RelicsLibrary {
    private static instance: RelicsLibrary;
    private beneficialRelics: AbstractRelic[];
    private cursedCargoRelics: AbstractRelic[];
    private cursedCargoCards: PlayableCard[];

    private constructor() {
        this.beneficialRelics = [
            new Catspaw(),
            new HopeCandle(),
            new TornPage(),
            new MistBottle(),
            new FrozenDew(),
            new IronFilings(),
            new GlassCross(),
            new CaskOfErrantSouls(),
            new VialOfBlood(),
        ];

        this.cursedCargoRelics = [
            new SonorousKlaxon(),
            new AkashicNewspaper(),
            new BloomOfSorrow(),
            new BomberGremlin(),
            new DevouringIcon(),
            //new EldritchManuscript(),
            new GreedyParasite(),
            new OublietteFlower(),
            new ScreamingParasite(),
            new SonorousKlaxon(),
            new WhisperOfSorrow(),
            new WraithInABottle()
        ];

        this.cursedCargoCards = [
            new SirenDaguerreotype(),
            new WatchfulClown(),
            new BurningCommissar(),
            new ChairmanVizzerix(),
            new TomeOfAvarice(),
            new MawSculpture()
        ];
    }

    public static getInstance(): RelicsLibrary {
        if (!RelicsLibrary.instance) {
            RelicsLibrary.instance = new RelicsLibrary();
        }
        return RelicsLibrary.instance;
    }

    public getAllBeneficialRelics(): AbstractRelic[] {
        var relics = this.beneficialRelics;
        relics.forEach(relic => relic.init());
        return relics.map(relic => relic.copy());
    }

    public getRandomBeneficialRelics(count: number): AbstractRelic[] {
        var relics = this.beneficialRelics
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .map(relic => relic.copy());
        relics.forEach(relic => relic.init());
        return relics;
    }
    public getAllCursedRelics(): AbstractRelic[] {
        var relics = this.cursedCargoRelics;
        relics.forEach(relic => relic.init());
        return relics.map(relic => relic.copy());
    }

    public getRandomCursedRelics(count: number): AbstractRelic[] {
        var relics = this.cursedCargoRelics
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .map(relic => relic.copy());
        relics.forEach(relic => relic.init());
        return relics;
    }

    public getAllCursedCards(): PlayableCard[] {
        var cards = this.cursedCargoCards;
        cards.forEach(card => card.initialize());
        return cards.map(card => card.Copy());
    }

    public getRandomCursedCards(count: number): PlayableCard[] {
        var cards = this.cursedCargoCards
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .map(card => card.Copy());
        cards.forEach(card => card.initialize());
        return cards;
    }
}
