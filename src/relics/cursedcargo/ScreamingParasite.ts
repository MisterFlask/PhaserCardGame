import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractCombatResource } from "../../rules/combatresources/AbstractCombatResource";
import { GameState } from "../../rules/GameState";
import { AbstractRelic } from "../AbstractRelic";

export class ScreamingParasite extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.RARE;
    }

    override getDisplayName(): string {
        return "Screaming Parasite";
    }

    override getDescription(): string {
        return "Whenever you spend Blood, all allies gain 1 Stress.";
    }

    override afterCombatResourceSpent(resourceWithNewQuantity: AbstractCombatResource, amountSpent: number){
        const gameState = GameState.getInstance();
        if (!gameState.combatState || resourceWithNewQuantity.name !== "Blood" || amountSpent <= 0) {
            return;
        }

        gameState.combatState.playerCharacters.forEach(character => {
            this.actionManager.applyBuffToCharacter(character, new Stress(1));
        });
    }
}
