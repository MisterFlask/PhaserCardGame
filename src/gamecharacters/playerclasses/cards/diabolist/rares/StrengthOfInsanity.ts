import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { IncreasePluck } from "../../../../buffs/standard/combatresource/IncreasePluck";
import { Stress } from "../../../../buffs/standard/Stress";
import { Lethality } from "../../../../buffs/standard/Strong";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class StrengthOfInsanity extends PlayableCard {
    constructor() {
        super({
            name: "Strength of Insanity",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 1;
        this.baseMagicNumber = 4; // Amount of Strength to apply
        this.buffs.push(new IncreasePluck(1));
    }

    override get description(): string {
        return `All allies gain ${this.getDisplayedMagicNumber()} Lethality. >10 stress: repeat. >30 stress: repeat again.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();

        // Get the owner of this card
        const owner = this.owner as BaseCharacter;
        if (!owner) {
            console.warn("StrengthOfInsanity: No owner found for this card");
            return;
        }

        // Find the Stress buff on the owner
        const stressBuff = owner.buffs.find(buff => buff.getDisplayName() === new Stress().getDisplayName());
        const stress = stressBuff ? stressBuff.stacks : 0;
        // Apply Strength to all allies
        this.applyStrengthToAllies();

        // Check stress levels and repeat if necessary
        if (stress > 4) {
            this.applyStrengthToAllies();
        }
        if (stress > 9) {
            this.applyStrengthToAllies();
        }
    }

    private applyStrengthToAllies(): void {
        this.forEachAlly(ally => {
            this.actionManager.applyBuffToCharacterOrCard(ally as BaseCharacter, new Lethality(this.getBaseMagicNumberAfterResourceScaling()));
        });
    }
}
