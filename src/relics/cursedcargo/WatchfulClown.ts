import { TargetingType } from "../../../AbstractCard";
import { EntityRarity, PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";
import { AbstractBuff } from "../../../buffs/AbstractBuff";
import { Jumpscare } from "./Jumpscare";

class AmbientJumpscareBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = true;
        this.moveToMainDescription = true;
    }

    override getDisplayName(): string {
        return "Ambient Jumpscare";
    }

    override getDescription(): string {
        return "At the end of combat where no character gained Stress, add a Jumpscare to a random ally's master deck.";
    }

    override onCombatEnd(): void {
        const gameState = this.gameState;
        const combatState = gameState.combatState;
        
        // Check if any character gained stress during combat
        const anyStressGained = combatState.playerCharacters.some(char => 
            char.getBuffStacks("Stress") > 0
        );

        if (!anyStressGained) {
            // Get random living ally
            const livingAllies = combatState.playerCharacters.filter(char => !char.isDead());
            if (livingAllies.length > 0) {
                const randomAlly = livingAllies[Math.floor(Math.random() * livingAllies.length)];
                // Add Jumpscare to their master deck
                randomAlly.cardsInMasterDeck.push(new Jumpscare());
            }
        }
    }
}

export class AmbientJumpscare extends PlayableCard {
    constructor() {
        super({
            name: "Ambient Jumpscare",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 0;
        this.buffs.push(new AmbientJumpscareBuff());
    }

    override InvokeCardEffects(): void {
        // The effect happens at end of combat via AmbientJumpscareBuff
    }

    override get description(): string {
        return `At the end of any combat where no character gained Stress, add a Jumpscare to a random ally's master deck.`;
    }
} 