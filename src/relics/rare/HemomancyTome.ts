// At the start of combat, two random cards in your draw pile are granted Bloodprice 2.

import { BloodPriceBuff } from "../../gamecharacters/buffs/standard/Bloodprice";
import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { GameState } from "../../rules/GameState";
import { ActionManager } from "../../utils/ActionManager";
import { AbstractRelic } from "../AbstractRelic";

export class HemomancyTome extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.RARE;
    }

    override getDisplayName(): string {
        return "Hemomancy Tome";
    }

    override getDescription(): string {
        return "At the start of combat, two random cards in your draw pile are granted Bloodprice 2.";
    }

    override onCombatStart(): void {
        const drawPile = GameState.getInstance().combatState.drawPile;
        if (drawPile.length >= 2) {
            // Get two random indices
            const indices = new Set<number>();
            while (indices.size < 2) {
                indices.add(Math.floor(Math.random() * drawPile.length));
            }
            
            // Apply Bloodprice to the selected cards
            [...indices].forEach(index => {
                const card = drawPile[index];
                ActionManager.getInstance().applyBuffToCard(card, new BloodPriceBuff(2));
            });
        }
    }
}

