import { CardRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class HopeCandle extends AbstractRelic {
    constructor() {
        super();
        this.name = "Hope Candle";
        this.description = "At the end of combat, decrease your Stress by 1.";
        this.rarity = CardRarity.COMMON;
    }

    onCombatEnd(): void {
        this.gameState.combatState.playerCharacters.forEach(character => {
            this.actionManager.relieveStressFromCharacter(character, 1);
        });
    }
}
