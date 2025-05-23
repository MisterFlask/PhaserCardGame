// Buff: Obol Debt.  At the beginning of each turn, add a Ferryman's Fee card to your hand.  It has ethereal and exhaust.  Playing it costs 5 hell currency.  if in hand at end of turn, all enemies gain 2 strength.

// The Fare Enforcer alternates between blocking and attacking a random character twice.

import { TargetingType } from "../../../gamecharacters/AbstractCard";
import { AbstractIntent, AttackIntent, BlockForSelfIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { AbstractBuff } from "../../../gamecharacters/buffs/AbstractBuff";
import { ExhaustBuff } from "../../../gamecharacters/buffs/playable_card/ExhaustBuff";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";
import { EntityRarity } from "../../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { CardType } from "../../../gamecharacters/Primitives";

class FerrymansFee extends PlayableCard {
    constructor() {
        super({
            name: "Ferryman's Fee",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 0;
        this.hellPurchaseValue = 5;
        this.buffs.push(new ExhaustBuff());
    }

    override get description(): string {
        return "Costs 5 🔥 to play. Exhaust.";
    }

    override InvokeCardEffects(): void {
        // The actual effect is handled by the ActionManager's buyItemForHellCurrency method
    }
}

class ObolDebtBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Obol Debt";
    }

    override getDescription(): string {
        return "At the beginning of each turn, add a Ferryman's Fee card to your hand. If in hand at end of turn, all enemies gain 2 Strength.";
    }

    override onTurnStart(): void {
        const ferrymansFee = new FerrymansFee();
        ferrymansFee.owningCharacter = this.getOwnerAsCharacter()!;
        this.actionManager.createCardToHand(ferrymansFee);
    }

    override onInHandAtEndOfTurn(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            this.forEachEnemy(enemy => {
                this.actionManager.applyBuffToCharacter(enemy, new Lethality(2));
            });
        }
    }
}

export class FareEnforcer extends AutomatedCharacter {
    private isBlockingTurn: boolean = false;

    constructor() {
        super({
            name: "Fare Enforcer",
            portraitName: "fare_enforcer",
            maxHitpoints: 45,
            description: "A relentless collector of debts, ensuring all pay their fare to cross the river."
        });
        this.buffs.push(new ObolDebtBuff());
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[] = [];
        
        if (this.isBlockingTurn) {
            intents.push(new BlockForSelfIntent({ blockAmount: 15, owner: this }).withTitle("Collecting Debts"));
        } else {
            // Attack a random character twice
            intents.push(new AttackIntent({ baseDamage: 8, owner: this }).withTitle("Demand Payment"));
            intents.push(new AttackIntent({ baseDamage: 8, owner: this }).withTitle("Demand Payment"));
        }

        this.isBlockingTurn = !this.isBlockingTurn;
        return intents;
    }
}