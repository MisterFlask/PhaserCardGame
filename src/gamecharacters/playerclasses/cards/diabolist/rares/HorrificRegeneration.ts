import { GameState } from "../../../../../rules/GameState";
import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Stress } from "../../../../buffs/standard/Stress";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class HorrificRegeneration extends PlayableCard {
    constructor() {
        super({
            name: "Horrific Regeneration",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.RARE,
        });
        this.energyCost = 3; // Assuming a cost for the card
    }
    override get description(): string {
        return `All party members heal ${this.getDisplayedMagicNumber()} HP. They also gain 20 stress. Exhaust.`;
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Heal all party members
        combatState.playerCharacters.forEach(character => {
            this.actionManager.heal(character, this.getBaseMagicNumberAfterResourceScaling());
            character.buffs.push(new Stress(4));
        });

        // Exhaust this card
        this.actionManager.exhaustCard(this);
    }

    override OnPurchase(): void {
        // Logic for when the card is purchased, if needed
    }
}
