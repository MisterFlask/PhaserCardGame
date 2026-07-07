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
        this.flavorText = "Heads, tails, or the Company's crest. It always lands crest-up.";
    }

    override InvokeCardEffects(): void {
        GameState.getInstance().moneyInVault += 4;
    }

    override get description(): string {
        return `Gain £4. Exhaust.`;
    }
} 