import { GameState } from "../../../../rules/GameState";
import { TargetingType } from "../../../AbstractCard";
import { EntityRarity } from "../../../EntityRarity";
import { PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";
import { ExhaustBuff } from "../../../buffs/playable_card/ExhaustBuff";

export class CoinOnTheGround extends PlayableCard {
    constructor() {
        super({
            name: "Coin On The Ground",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new ExhaustBuff());
    }

    override InvokeCardEffects(): void {
        GameState.getInstance().britishPoundsSterling += 4;
    }

    override get description(): string {
        return `Gain 4 Sovereign Infernal Notes. Exhaust.`;
    }
} 