import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "../standard/Lethality";
import { DamageInfo } from "../../../rules/DamageInfo";
import { ValuableCargo } from "../standard/ValuableCargo";
import { GameState } from "../../../rules/GameState";

export class GreedIncarnate extends AbstractBuff {
    private damageThisTurn: number = 0;
    private triggeredThisTurn: boolean = false;

    constructor() {
        super();
        this.isDebuff = false;
        this.imageName = "greed";
    }

    override getDisplayName(): string { return "Greed Incarnate"; }

    override getDescription(): string {
        return "Cargo played heals this foe and grants Lethality. Taking 50 damage in a turn grants Obols. Gains half of any currency you acquire.";
    }

    override onTurnStart(): void {
        this.damageThisTurn = 0;
        this.triggeredThisTurn = false;
    }

    override onAnyCardPlayedByAnyone(card: PlayableCard): void {
        if (card.buffs.some(b => b instanceof ValuableCargo)) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                this.actionManager.heal(owner, 10);
                this.actionManager.applyBuffToCharacter(owner, new Lethality(3));
            }
        }
    }

    override onOwnerStruck_CannotModifyDamage(_strikingUnit: BaseCharacter | null, _cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void {
        this.damageThisTurn += damageInfo.unblockedDamageTaken;
        if (!this.triggeredThisTurn && this.damageThisTurn >= 50) {
            GameState.getInstance().obols += 15;
            this.triggeredThisTurn = true;
        }
    }

    /** Called when heroes gain currency. Returns remaining amount for the heroes. */
    public stealCurrency(amount: number): number {
        if (amount <= 0) return amount;
        const steal = Math.ceil(amount / 2);
        GameState.getInstance().obols += steal;
        return amount - steal;
    }
}
