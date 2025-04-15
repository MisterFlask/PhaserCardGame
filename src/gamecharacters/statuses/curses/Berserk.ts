/**
 * Deal 4 damage.  Lose 1 Dexterity and gain 1 Strength.  Hazardous (3).  Cost 1 energy.
 */
import { TargetingType } from "../../AbstractCard";
import { BaseCharacter } from "../../BaseCharacter";
import { EntityRarity } from "../../EntityRarity";
import { PlayableCard } from "../../PlayableCard";
import { CardType } from "../../Primitives";
import { Dexterity } from "../../buffs/persona/Dexterity";
import { Hazardous } from "../../buffs/playable_card/Hazardous";
import { Lethality } from "../../buffs/standard/Lethality";

export class Berserk extends PlayableCard {
    constructor() {
        super({
            name: "Berserk",
            cardType: CardType.STATUS,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 1;
        this.baseDamage = 4;
        this.buffs.push(new Hazardous(3));
        this.portraitName = "berserk-curse";
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Lose 1 Dexterity and gain 1 Strength. Hazardous (3).`;
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard) {
            this.actionManager.dealDamage({
                baseDamageAmount: this.baseDamage,
                target: targetCard,
                sourceCharacter: this.owningCharacter,
                fromAttack: true,
                sourceCard: this
            });
        }

        const owner = this.owningCharacter;
        if (owner) {
            // Lose 1 Dexterity
            this.actionManager.applyBuffToCharacter(owner, new Dexterity(-1));
            
            // Gain 1 Strength (Lethality is the Strength equivalent)
            this.actionManager.applyBuffToCharacter(owner, new Lethality(1));
        }
    }
}