import { TargetingType } from "../AbstractCard";
import { EntityRarity } from "../EntityRarity";
import { PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";
import { Heavy } from "../buffs/playable_card/Heavy";
import { Hazardous } from "../buffs/playable_card/Hazardous";

export class BrokenGear extends PlayableCard {
    constructor(){
        super({
            name: "Broken Gear",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 0;
        this.buffs.push(new Heavy());
        this.buffs.push(new Hazardous(2));
    }

    override get description(): string {
        return "Clutters your deck.";
    }

    override InvokeCardEffects(): void {}
}
