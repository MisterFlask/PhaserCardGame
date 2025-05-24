import { DamageInfo } from "../../../rules/DamageInfo";
import { GameState } from "../../../rules/GameState";
import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "../standard/Lethality";
import { ValuableCargo } from "../standard/ValuableCargo";

export class GreedIncarnate extends AbstractBuff {
    private triggeredThisTurn: boolean = false;

    constructor() {
        super();
        this.isDebuff = false;
        this.imageName = "greed";
        this.stacks = 50; // damage needed in a turn to trigger Loaded
        this.secondaryStacks = 0; // damage observed this turn
    }

    override getDisplayName(): string { return "Greed Incarnate"; }

    override getDescription(): string {
        return `Cargo cards heal this foe and grant Lethality. If it takes ${this.stacks} or more damage in a single turn, it gains 15 sovereign infernal notes.`;
    }

    override onTurnStart(): void {
        this.secondaryStacks = 0;
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
        this.secondaryStacks += damageInfo.unblockedDamageTaken;
        if (!this.triggeredThisTurn && this.secondaryStacks >= this.stacks) {
            GameState.getInstance().sovereignInfernalNotes += 15;
            this.triggeredThisTurn = true;
        }
    }
}
