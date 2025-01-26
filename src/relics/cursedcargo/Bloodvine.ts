import { Regeneration } from "../../gamecharacters/buffs/enemy_buffs/Regeneration";
import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { GameState } from "../../rules/GameState";
import { AbstractRelic } from "../AbstractRelic";

export class Bloodvine extends AbstractRelic {
    private readonly REGEN_AMOUNT = 4;

    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
    }

    override getDisplayName(): string {
        return "Bloodvine";
    }

    override getDescription(): string {
        return `At the beginning of boss combats, all enemies gain ${this.REGEN_AMOUNT} Regeneration.`;
    }

    override onCombatStart(): void {
        const gameState = GameState.getInstance();
        if (!gameState.combatState || !gameState.currentLocation || gameState.currentLocation.segment !== 3) {
            return;
        }

        this.forEachEnemy(enemy => {
            this.actionManager.applyBuffToCharacter(enemy, new Regeneration(this.REGEN_AMOUNT));
        });
    }
}