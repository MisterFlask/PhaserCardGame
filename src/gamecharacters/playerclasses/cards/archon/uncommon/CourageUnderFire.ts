import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Strong } from "../../../../buffs/standard/Strong";

export class CourageUnderFire extends PlayableCard {
    constructor() {
        super({
            name: "Courage Under Fire",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.UNCOMMON,
        });
        this.portraitName = "CourageUnderFire";
        this.baseEnergyCost = 2;
        this.baseBlock = 5;
        this.baseMagicNumber = 1; // Amount of Strength to apply
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const allCharacters = [...this.combatState.playerCharacters, ...this.combatState.enemies];

        allCharacters.forEach(character => {
            this.applyEffectsToCharacter(character);

            if (character.stress > 5) {
                this.applyEffectsToCharacter(character);
            }

            if (character.stress > 9) {
                this.applyEffectsToCharacter(character);
            }
        });
    }

    private applyEffectsToCharacter(character: BaseCharacter): void {
        this.applyBlockToTarget(character);
        this.actionManager.applyBuffToCharacterOrCard(character, new Strong(this.getBaseMagicNumberAfterResourceScaling()));
    }

    override get description(): string {
        return `All characters gain ${this.getDisplayedBlock()} Block and ${this.getDisplayedMagicNumber()} Strength. For each character that has > 5 Stress, do this again. For each character with > 9 Stress, do it again.`;
    }
}
