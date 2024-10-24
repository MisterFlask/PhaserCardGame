import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";
import { TakeCover } from "../tokens/TakeCover";

export class ChainOfCommand extends PlayableCard {
    constructor() {
        super({
            name: "Chain of Command",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.RARE,
        });
        this.energyCost = 2;
        this.baseDamage = 8;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Deal 8 damage to ALL enemies
        combatState.enemies.forEach(enemy => {
            this.dealDamageToTarget(enemy);
        });

        // Gain 2 energy
        combatState.energyAvailable += 2;

        // Draw two cards
        this.actionManager.drawCards(2);

        // All party members take 1 Stress
        combatState.playerCharacters.forEach(ally => {
            ally.stress += 1;
        });

        BasicProcs.getInstance().ManufactureCardToHand(new TakeCover());
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage to ALL enemies. Gain 2 energy. Draw two cards. All party members take 1 Stress.`;
    }
}
