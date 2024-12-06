import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Lethality } from "../../../../buffs/standard/Strong";

export class HoldTheLine extends PlayableCard {
    constructor() {
        super({
            name: "Hold The Line",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.UNCOMMON,
        });
        this.portraitName = "CourageUnderFire";
        this.baseEnergyCost = 2;
        this.baseBlock = 5;
        this.baseMagicNumber = 1;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const allCharacters = [...this.combatState.playerCharacters, ...this.combatState.enemies];

        allCharacters.forEach(character => {
            this.applyEffectsToCharacter(character);
        });
    }

    private applyEffectsToCharacter(character: BaseCharacter): void {
        for (let i = 0; i < character.getIntentsTargetingThisCharacter().length; i++) { 
            this.applyBlockToTarget(character);
            this.actionManager.applyBuffToCharacterOrCard(character, new Lethality(this.getBaseMagicNumberAfterResourceScaling()));
        }
    }

    override get description(): string {
        return `All characters gain ${this.getDisplayedBlock()} Block and ${this.getDisplayedMagicNumber()} Lethality. For each intent aimed at that character, do it again.`;
    }
}
