import { TargetingType } from "../../../gamecharacters/AbstractCard";
import { BaseCharacter } from "../../../gamecharacters/BaseCharacter";
import { Stress } from "../../../gamecharacters/buffs/standard/Stress";
import { EntityRarity } from "../../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { CardType } from "../../../gamecharacters/Primitives";
import { CombatResourceUsedEvent } from "../../../rules/combatresources/AbstractCombatResource";

export class SneeringRevolver extends PlayableCard {
    private mettleSpentThisCombat: boolean = false;

    constructor() {
        super({
            name: "Sneering Revolver",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.baseDamage = 15;
        this.portraitName = "cursed_cargo_1";
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. At the end of combat, if you did NOT spend Mettle, every ally takes 2 Stress.`;
    }

    OnCombatStart(): void {
        this.mettleSpentThisCombat = false;
    }

    onEvent(event: CombatResourceUsedEvent): void {
        if (event.isMettle()) {
            this.mettleSpentThisCombat = true;
        }
    }

    OnCombatEnd(): void {
        if (!this.mettleSpentThisCombat) {
            this.forEachAlly((ally) => {
                this.actionManager.applyBuffToCharacter(ally, new Stress(2));
            });
        }
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (!targetCard) return;
        
        this.actionManager.dealDamage({
            baseDamageAmount: this.getBaseDamageAfterResourceScaling(),
            target: targetCard,
            fromAttack: true
        });
    }
}
