import { CombatResourceGainedResult } from "../../gamecharacters/buffs/AbstractBuff";
import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { AbstractCombatResource } from "../../rules/combatresources/AbstractCombatResource";
import { GameState } from "../../rules/GameState";
import { AbstractRelic } from "../AbstractRelic";

export class GreedyParasite extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.RARE;
    }

    override getDisplayName(): string {
        return "Greedy Parasite";
    }

    override getDescription(): string {
        return "Whenever you would gain a combat resource, instead gain 1 more. At the start of your turn, if you have a total of more than 3 combat resources of any type, take 10 damage.";
    }

    override onTurnStart(): void {
        const gameState = GameState.getInstance();
        if (!gameState.combatState) {
            return;
        }

        // Sum up all combat resources
        const totalResources = gameState.combatState.combatResources.resources().reduce((sum, resource) => sum + resource.value, 0);

        // If total resources > 3, deal 10 damage to owner
        if (totalResources > 3) {
            this.actionManager.dealDamage({
                baseDamageAmount: 10,
                target: gameState.combatState.playerCharacters[0], // Deal damage to first player character
                fromAttack: false
            });
        }
    }

    override modifyCombatResourceGained(resourceWithOldQuantity: AbstractCombatResource, amountToBeGained: number): CombatResourceGainedResult {
        if (amountToBeGained <= 0) {
            return {
                newAmountToBeGained: amountToBeGained,
                logicTriggered: false,
                preventGaining: false
            };
        }

        // Gain 1 additional of whatever resource was gained
        return {
            newAmountToBeGained: amountToBeGained + 1,
            logicTriggered: true,
            preventGaining: false
        };
    }
} 