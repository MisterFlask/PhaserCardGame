import { TargetingType } from "../../gamecharacters/AbstractCard";
import { ExhaustBuff } from "../../gamecharacters/buffs/playable_card/ExhaustBuff";
import { CardRarity, PlayableCard } from "../../gamecharacters/PlayableCard";
import { CardType, } from "../../gamecharacters/Primitives";
import { BasicProcs } from "../../gamecharacters/procs/BasicProcs";
import { Faction } from "../../maplogic/Faction";
import { AbstractRelic } from "../AbstractRelic";

class HolyBombardment extends PlayableCard {
    constructor() {
        super({
            name: "Holy Bombardment",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: CardRarity.SPECIAL,
        });
        this.baseDamage = 25;
        this.buffs = [new ExhaustBuff()];
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Holy.  Exhaust. Sacrifice.`;
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
        this.description = "In Spanish areas, at the start of combat, manufacture a Holy Bombardment to your hand.";
        this.rarity = CardRarity.COMMON;
    }

    override onCombatStart(): void {
        const currentLocation = this.gameState.currentLocation;
        if (currentLocation && currentLocation.controllingFaction === Faction.SPANISH) {
            const holyBombardment = new HolyBombardment();
            BasicProcs.getInstance().ManufactureCardToHand(holyBombardment);
        }
    }
}
