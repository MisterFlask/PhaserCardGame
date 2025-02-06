// relic. Startup: apply Hazardous 3 to 3 random cards in your draw pile. 
// At the start of the seventh turn of combat, deal 40 damage to all enemies.  

import { Hazardous } from "../../gamecharacters/buffs/playable_card/Hazardous";
import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { GameState } from "../../rules/GameState";
import { ActionManager } from "../../utils/ActionManager";
import { AbstractRelic } from "../AbstractRelic";

export class BomberGremlin extends AbstractRelic {
    private readonly BASE_HAZARDOUS_STACKS = 3;
    private readonly BASE_DAMAGE = 40;
    private readonly TURN_TO_EXPLODE = 7;

    constructor() {
        super();
        this.rarity = EntityRarity.UNCOMMON;
        this.stacks = 0; // Used to track turns
    }

    override getDisplayName(): string {
        return "Bomber Gremlin";
    }

    override getDescription(): string {
        return `Startup: apply Hazardous ${this.BASE_HAZARDOUS_STACKS} to 3 random cards in your draw pile. At the start of the seventh turn of combat, deal ${this.BASE_DAMAGE} damage to all enemies.`;
    }

    override onCombatStart(): void {
        const drawPile = GameState.getInstance().combatState.drawPile;
        if (drawPile.length >= 3) {
            // Get three random indices
            const indices = new Set<number>();
            while (indices.size < 3) {
                indices.add(Math.floor(Math.random() * drawPile.length));
            }
            
            // Apply Hazardous to the selected cards
            [...indices].forEach(index => {
                const card = drawPile[index];
                ActionManager.getInstance().applyBuffToCard(card, new Hazardous(this.BASE_HAZARDOUS_STACKS));
            });
        }
        this.stacks = 0; // Reset turn counter
    }

    override onTurnStart(): void {
        this.stacks++; // Increment turn counter
        
        if (this.stacks === this.TURN_TO_EXPLODE) {
            // Deal damage to all enemies
            this.forEachEnemy(enemy => {
                ActionManager.getInstance().dealDamage({
                    baseDamageAmount: this.BASE_DAMAGE,
                    target: enemy,
                    fromAttack: false
                });
            });
        }
    }
}  