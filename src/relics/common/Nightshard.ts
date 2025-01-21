import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { ErraticIncantation } from "../../gamecharacters/playerclasses/cards/other/tokens/ErraticIncantation";
import { GameState } from "../../rules/GameState";
import { AbstractRelic } from "../AbstractRelic";

export class Nightshard extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
        this.clickable = true;
        this.stacks = 2; // Base number of uses per combat
    }

    override getDisplayName(): string {
        return "Nightshard";
    }

    override getDescription(): string {
        return `Click to manufacture an Erratic Incantation to your hand. Can be used ${this.stacks} times per combat.`;
    }

    override onCombatStart(): void {
        this.secondaryStacks = this.stacks; // Reset uses at start of combat
    }

    override onClicked(): void {
        const gameState = GameState.getInstance();
        if (!gameState.combatState || this.secondaryStacks <= 0) {
            return;
        }

        gameState.combatState.currentHand.push(new ErraticIncantation());
        this.secondaryStacks--;
    }
}
