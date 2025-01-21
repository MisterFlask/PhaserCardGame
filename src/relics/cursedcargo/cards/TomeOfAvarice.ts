import { GameState } from "../../../../rules/GameState";
import { TargetingType } from "../../../AbstractCard";
import { EntityRarity, PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";
import { ExhaustBuff } from "../../../buffs/playable_card/ExhaustBuff";
import { RetainBuff } from "../../../buffs/playable_card/Retain";
import { CoinOnTheGround } from "./CoinOnTheGround";

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
    }

    override InvokeCardEffects(): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;
        const livingAllies = combatState.playerCharacters.filter(char => !char.isDead());
        
        if (livingAllies.length > 0) {
            const randomAlly = livingAllies[Math.floor(Math.random() * livingAllies.length)];
            const coinCard = new CoinOnTheGround();
            coinCard.owningCharacter = randomAlly;
            randomAlly.cardsInMasterDeck.push(coinCard);
        }
    }

    override get description(): string {
        return `Add a Coin On The Ground to a random ally's master deck. Exhaust. Retain: lose 4 Denarians.`;
    }

    OnRetain(): void {
        GameState.getInstance().hellExportCurrency -= 4;
    }
} 