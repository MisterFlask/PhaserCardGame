import { Scene } from 'phaser';
import { PlayerCharacter } from '../../../gamecharacters/BaseCharacterClass';
import { PlayableCard } from '../../../gamecharacters/PlayableCard';
import { CoalCargo } from '../../../gamecharacters/playerclasses/cards/cargo/CoalCargo';
import { CoffeeCargo } from '../../../gamecharacters/playerclasses/cards/cargo/CoffeeCargo';
import { SpicyLiteratureCargo } from '../../../gamecharacters/playerclasses/cards/cargo/SpicyLiteratureCargo';
import { CampaignRules } from '../../../rules/CampaignRules';
import { GameState } from '../../../rules/GameState';
import { AbstractTradeRoute, StandardTradeRoute } from './AbstractTradeRoute';
import { StrategicImprovementCard } from './StrategicImprovementCard';

export class CampaignState {
    private static instance: CampaignState;

    public currentYear: number = 1;
    public shareholderExpectation: number = 1000;
    public availableTradeRoutes: AbstractTradeRoute[] = [new StandardTradeRoute(),new StandardTradeRoute(),new StandardTradeRoute()];
    public ownedFactories: StrategicImprovementCard[] = [];
    public availableFactories: StrategicImprovementCard[] = [];
    public selectedTradeRoute: AbstractTradeRoute | null = null;
    public selectedParty: PlayerCharacter[] = [];
    public roster: PlayerCharacter[] = CampaignRules.getInstance().generateLogicalCharacterRoster();
    public availableTradeGoods: PlayableCard[] = [new CoffeeCargo(), new CoalCargo(), new SpicyLiteratureCargo()];
    public ownedTradeGoods: PlayableCard[] = [];
    
    private constructor() {}

    public static getInstance(): CampaignState {
        if (!CampaignState.instance) {
            CampaignState.instance = new CampaignState();
        }
        return CampaignState.instance;
    }

    public getCurrentFunds(): number {
        return GameState.getInstance().surfaceCurrency;
    }

    public getShareholderSatisfaction(): number {
        return this.getCurrentFunds() / this.shareholderExpectation;
    }

    public addTradeGood(good: PlayableCard, scene: Scene): void {
        this.ownedTradeGoods.push(good);
        scene.events.emit('tradeGoodsChanged');
    }

    public removeTradeGood(good: PlayableCard, scene: Scene): void {
        const index = this.ownedTradeGoods.indexOf(good);
        if (index > -1) {
            this.ownedTradeGoods.splice(index, 1);
            scene.events.emit('tradeGoodsChanged');
        }
    }
} 