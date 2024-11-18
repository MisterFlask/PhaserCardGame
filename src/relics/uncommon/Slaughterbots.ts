import { TargetingType } from "../../gamecharacters/AbstractCard";
import { EntityRarity, PlayableCard } from "../../gamecharacters/PlayableCard";
import { CardType } from "../../gamecharacters/Primitives";
import { BasicProcs } from "../../gamecharacters/procs/BasicProcs";
import { AbstractRelic } from "../AbstractRelic";

class SlaughterbotCard extends PlayableCard {
    constructor() {
        super({
            name: "Slaughterbot",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 1;
        this.baseDamage = 12;
    }


    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage.`;
    }

    override InvokeCardEffects(): void {
        this.performActionOnRandomEnemy(enemy => {
            this.dealDamageToTarget(enemy);
        });
    }
}

export class Slaughterbots extends AbstractRelic {
    constructor() {
        super();
        this.name = "Slaughterbots";
        this.description = "At the start of combat, add two Slaughterbots to your hand.";
        this.rarity = EntityRarity.UNCOMMON;
    }

    override onCombatStart(): void {
        for (let i = 0; i < 2; i++) {
            const slaughterbot = new SlaughterbotCard();
            BasicProcs.getInstance().ManufactureCardToHand(slaughterbot);
        }
    }
}
