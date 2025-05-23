import { AbstractBuff } from "../AbstractBuff";
import { ActionManager } from "../../../utils/ActionManager";
import { GameState } from "../../../rules/GameState";
import { Tariffed } from "../playable_card/Tariffed";
import Phaser from "phaser";

export class TariffAura extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
        this.imageName = "coins";
    }

    override getDisplayName(): string {
        return "Mad Toll";
    }

    override getDescription(): string {
        return "At the start of each turn, a random card in hand costs 1 more energy.";
    }

    override onTurnStart(): void {
        const hand = GameState.getInstance().combatState.currentHand;
        if (hand.length > 0) {
            const randomIndex = Phaser.Math.Between(0, hand.length - 1);
            const randomCard = hand[randomIndex];
            ActionManager.getInstance().applyBuffToCard(randomCard, new Tariffed());
        }
    }
}
