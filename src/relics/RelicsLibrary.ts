import { PlayableCard } from '../gamecharacters/PlayableCard';
import { AbstractRelic } from './AbstractRelic';
import { FrozenDew } from './common/FrozenDew';
import { GlassCross } from './common/GlassCross';
import { IronFilings } from './common/IronFilings';
import { MarksmansManual } from './common/MarksmansManual';
import { MistBottle } from './common/MistBottle';
import { TornPage } from './common/TornPage';
import { VialOfBlood } from './common/VialOfBlood';
import { BelphegorsRounds } from './rare/BelphegorsRounds';
import { AkashicNewspaper } from './cursedcargo/AkashicNewspaper';
import { BloomOfSorrow } from './cursedcargo/BloomOfSorrow';
import { BomberGremlin } from './cursedcargo/BomberGremlin';
import { ChairmanVizzerix } from './cursedcargo/cards/ChairmanVizzerix';
import { MawSculpture } from './cursedcargo/cards/MawSculpture';
import { SirenDaguerreotype } from './cursedcargo/cards/SirenDaguerreotype';
import { SneeringRevolver } from './cursedcargo/cards/SneeringRevolver';
import { TomeOfAvarice } from './cursedcargo/cards/TomeOfAvarice';
import { WatchfulClown } from './cursedcargo/cards/WatchfulClown';
import { DevouringIcon } from './cursedcargo/DevouringIcon';
import { GreedyParasite } from './cursedcargo/GreedyParasite';
import { OublietteFlower } from './cursedcargo/OublietteFlower';
import { ScreamingParasite } from './cursedcargo/ScreamingParasite';
import { SonorousKlaxon } from './cursedcargo/SonorousKlaxon';
import { WhisperOfSorrow } from './cursedcargo/WhisperOfSorrow';
import { WraithInABottle } from './cursedcargo/WraithInABottle';
import { EcclesiasticalRecommendation } from './special/EcclesiasticalRecommendation';
import { EmergencyTeleporter } from './special/EmergencyTeleporter';

export class RelicsLibrary {
    private static instance: RelicsLibrary;
    private beneficialRelics: AbstractRelic[];
    private cursedCargoRelics: AbstractRelic[];
    private cursedCargoCards: PlayableCard[];
    /**
     * Relics that never appear in a shop/event random pool but still need
     * name resolution for the save round-trip: currently just
     * EmergencyTeleporter, which seeds the fresh-campaign armoury directly
     * (CampaignUiState.armoury) rather than being acquired in play. Only
     * consulted by getRelicByName — getRandomBeneficialRelics/
     * getAllBeneficialRelics deliberately don't include this pool.
     */
    private specialRelics: AbstractRelic[];

    private constructor() {
        this.beneficialRelics = [
            new MarksmansManual(),
            new TornPage(),
            new MistBottle(),
            new FrozenDew(),
            new IronFilings(),
            new GlassCross(),
            new VialOfBlood(),
            new BelphegorsRounds(),
            new EcclesiasticalRecommendation(),
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

        this.specialRelics = [
            new EmergencyTeleporter(),
        ];

        this.cursedCargoCards = [
            new SirenDaguerreotype(),
            new WatchfulClown(),
            new SneeringRevolver(),
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

    /**
     * Resolve a relic by its getDisplayName() literal, for the armoury save
     * round-trip (src/docs/relic_equipment_design.md) — mirrors
     * ConsumablesLibrary.getConsumableByName. Searches both beneficial and
     * cursed-cargo pools so any relic that ever reached a player's inventory
     * (shop, event, cursed cargo) can be reconstructed from a save. Returns
     * a fresh init()'d copy; undefined (with a caller-side warning) for an
     * unknown name rather than throwing.
     */
    public getRelicByName(name: string): AbstractRelic | undefined {
        const allRelics = [...this.beneficialRelics, ...this.cursedCargoRelics, ...this.specialRelics];
        const template = allRelics.find(relic => relic.getDisplayName() === name);
        if (!template) return undefined;
        const relic = template.copy();
        relic.init();
        return relic;
    }
}
