import { AbstractBuff } from "../AbstractBuff";
import { GameState } from "../../../rules/GameState";
import { Frostbite } from "../standard/Frostbite";
import { WarmYourself } from "../../playerclasses/cards/other/tokens/WarmYourself";
import { ActionManager } from "../../../utils/ActionManager";

export class AbsoluteZeroDoctrine extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
        this.imageName = "snowflake";
    }

    override getDisplayName(): string { return "Absolute Zero Doctrine"; }
    override getDescription(): string {
        return "At the start of each turn, the hero with the most HP gains Frostbite and you gain a Warm Yourself.";
    }

    override onTurnStart(): void {
        const gameState = GameState.getInstance();
        const players = gameState.combatState.playerCharacters.filter(p => p.hitpoints > 0);
        if (players.length > 0) {
            let target = players[0];
            for (const p of players) {
                if (p.hitpoints > target.hitpoints) {
                    target = p;
                }
            }
            ActionManager.getInstance().applyBuffToCharacter(target, new Frostbite(1));
        }
        ActionManager.getInstance().createCardToHand(new WarmYourself());
    }
}
