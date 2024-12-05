import { TargetingType } from "../../gamecharacters/AbstractCard";
import { ExhaustBuff } from "../../gamecharacters/buffs/playable_card/ExhaustBuff";
import { EntityRarity, PlayableCard } from "../../gamecharacters/PlayableCard";
import { CardType, } from "../../gamecharacters/Primitives";
import { BasicProcs } from "../../gamecharacters/procs/BasicProcs";
import { AbstractRelic } from "../AbstractRelic";

class HolyBombardment extends PlayableCard {
    constructor() {
        super({
            name: "Holy Bombardment",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseDamage = 15;
        this.buffs = [new ExhaustBuff()];
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Holy.  Exhaust.  Sacrifice.`;
    }

    override InvokeCardEffects(): void {
        this.performActionOnRandomEnemy(enemy => {
            this.dealDamageToTarget(enemy);
        });

        BasicProcs.getInstance().SacrificeACardOtherThan(this);
    }
}

export class GlassCross extends AbstractRelic {
    constructor() {
        super();
        this.name = "Glass Cross";
        this.description = `Click: Manufacture a Holy Bombardment to your hand. ${this.stacks} uses left.`;
        this.rarity = EntityRarity.COMMON;
        this.stacks = 3;
    }

    override onRelicClicked(): void {
        if (this.stacks === 0) {    
            return;
        }
        const holyBombardment = new HolyBombardment();
        BasicProcs.getInstance().ManufactureCardToHand(holyBombardment);
        this.stacks!--;
    }
}
