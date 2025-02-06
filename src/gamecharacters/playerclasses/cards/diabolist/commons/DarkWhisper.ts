// apply 1 Poisoned to all enemies and 3 block to all allies.  Cost 2.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Poisoned } from "../../../../buffs/standard/Poisoned";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";


export class DarkWhisper extends PlayableCard {
    constructor() {
        super({
            name: "Dark Whisper",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseBlock = 4;
        this.baseMagicNumber = 2;
        this.baseEnergyCost = 1;
        this.rarity = EntityRarity.COMMON;
    }

    override get description(): string {
        return `Apply ${this.getDisplayedMagicNumber()} Poisoned to all enemies and ${this.getDisplayedBlock()} block to all allies.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        this.forEachEnemy(enemy => {
            this.actionManager.applyBuffToCharacterOrCard(enemy as BaseCharacter, new Poisoned(this.getBaseMagicNumberAfterResourceScaling()));
        });
        this.forEachAlly(ally => {
            this.applyBlockToTarget(ally);
        });
    }
}
