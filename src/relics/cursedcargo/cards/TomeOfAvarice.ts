import { TargetingType } from "../../../gamecharacters/AbstractCard";
import { EntityRarity } from "../../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { CardType } from "../../../gamecharacters/Primitives";
import { ExhaustBuff } from "../../../gamecharacters/buffs/playable_card/ExhaustBuff";
import { RetainBuff } from "../../../gamecharacters/buffs/playable_card/Retain";
import { CoinOnTheGround } from "../../../gamecharacters/playerclasses/cards/other/CoinOnTheGround";
import { GameState } from "../../../rules/GameState";

export class TomeOfAvarice extends PlayableCard {
    constructor() {
        super({
            name: "Tome of Avarice",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new ExhaustBuff());
        this.buffs.push(new RetainBuff());
        this.portraitName = "cursed_cargo_4";
    }

    override InvokeCardEffects(): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;
        const cargo = gameState.cargoHolder;
        cargo.addCargoCard(new CoinOnTheGround());
    }


    override get description(): string {
        return `Add a Coin On The Ground to your cargo. Exhaust. Retain: lose 4 Denarians.`;
    }

    OnRetain(): void {
        GameState.getInstance().promissoryNotes -= 4;
    }
} 