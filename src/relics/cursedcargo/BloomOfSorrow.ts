import { Lethality } from "../../gamecharacters/buffs/standard/Strong";
import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { GameState } from "../../rules/GameState";
import { AbstractRelic } from "../AbstractRelic";

export class BloomOfSorrow extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
    }

    override getDisplayName(): string {
        return "Bloom of Sorrow";
    }

    override getDescription(): string {
        return "At the start of combat, all allies gain -2 Lethality.";
    }

    override onCombatStart(): void {
        const gameState = GameState.getInstance();
        if (!gameState.combatState) {
            return;
        }

        gameState.combatState.playerCharacters.forEach(character => {
            this.actionManager.applyBuffToCharacter(character, new Lethality(-2));
        });
    }
}
