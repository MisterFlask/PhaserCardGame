import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { CardRarity } from "../../gamecharacters/PlayableCard";
import { GameState } from "../../rules/GameState";
import { AbstractRelic } from "../AbstractRelic";

export class HopeFurnace extends AbstractRelic {
    private exhaustCount: number = 0;

    constructor() {
        super();
        this.name = "Hope Furnace";
        this.description = "The first five cards you exhaust in a combat, a random character is relieved of 1 stress.";
        this.rarity = CardRarity.UNCOMMON;
    }

    override onCardExhausted(): void {
        if (this.exhaustCount < 5) {
            this.exhaustCount++;
            const gameState = GameState.getInstance();
            const characters = gameState.combatState.allPlayerAndEnemyCharacters;
            const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
            
            const stressBuff = randomCharacter.buffs.find(buff => buff instanceof Stress) as Stress | undefined;
            if (stressBuff && stressBuff.stacks > 0) {
                stressBuff.stacks--;
                console.log(`${randomCharacter.name} was relieved of 1 stress by Hope Furnace.`);
            }
        }
    }

    override onCombatStart(): void {
        this.exhaustCount = 0;
    }
}
