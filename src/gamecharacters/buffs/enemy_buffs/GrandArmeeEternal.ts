import { AbstractCombatEvent } from "../../../rules/AbstractCombatEvent";
import { CharacterDeathEvent } from "../../../utils/actions/CombatEvents";
import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "../standard/Lethality";

export class GrandArmeeEternal extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
        this.imageName = "spear";
    }

    override getDisplayName(): string { return "Grand Armée Eternal"; }
    override getDescription(): string {
        return "When an ally dies, this character gains Lethality (2).";
    }

    override onEvent(event: AbstractCombatEvent): void {
        if (event instanceof CharacterDeathEvent) {
            const owner = this.getOwnerAsCharacter();
            if (owner && event.deadCharacter.team === owner.team && event.deadCharacter !== owner) {
                this.actionManager.applyBuffToCharacter(owner, new Lethality(2));
            }
        }
    }
}
