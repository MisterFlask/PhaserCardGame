import { AshesResource } from "../../../../../rules/combatresources/AshesResource";
import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { VolatileBuff } from "../../../../buffs/playable_card/VolatileCardBuff";
import { Burning } from "../../../../buffs/standard/Burning";
import { Poisoned } from "../../../../buffs/standard/Poisoned";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class ToxicSpill extends PlayableCard {
    constructor() {
        super({
            name: "Toxic Spill",
            cardType: CardType.SKILL,
            rarity: EntityRarity.RARE,
            targetingType: TargetingType.ENEMY,
        }); 
        this.baseEnergyCost = 2;
        this.baseMagicNumber = 6;
        this.buffs.push(new VolatileBuff());
        this.resourceScalings.push({
            resource: new AshesResource(),
            magicNumberScaling: 3
        })
    }

    override get description(): string {
        return `Apply 4 Burning and ${this.getDisplayedMagicNumber()} Poison to ALL enemies.`;
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        this.forEachEnemy(enemy => {
            this.actionManager.applyBuffToCharacterOrCard(enemy, new Burning(4));
            this.actionManager.applyBuffToCharacterOrCard(enemy, new Poisoned(this.getBaseMagicNumberAfterResourceScaling()));
        });
    }
}
