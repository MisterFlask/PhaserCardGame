import { GameState } from "../../../../../rules/GameState";
import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { Stress } from "../../../../buffs/standard/Stress";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class HorrificRegeneration extends PlayableCard {
    constructor() {
        super({
            name: "Horrific Regeneration",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 0; 
        this.baseMagicNumber = 15;
        this.buffs.push(new ExhaustBuff());
    }
    override get description(): string {
        return `All party members heal ${this.getDisplayedMagicNumber()} HP. They also gain 1 stress.`;
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Heal all party members
        combatState.playerCharacters.forEach(character => {
            this.actionManager.heal(character, this.getBaseMagicNumberAfterResourceScaling());
            character.buffs.push(new Stress(1));
        });

        // Exhaust this card
        this.actionManager.exhaustCard(this);
    }

}
