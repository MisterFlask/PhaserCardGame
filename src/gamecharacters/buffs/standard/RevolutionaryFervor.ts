import { AbstractBuff } from "../AbstractBuff";
import { AbstractCombatEvent } from "../../../rules/AbstractCombatEvent";
import { CharacterDeathEvent } from "../../../utils/actions/CombatEvents";
import { Lethality } from "./Lethality";

export class RevolutionaryFervor extends AbstractBuff {
    constructor(stacks: number = 1){
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.imageName = "fist";
    }

    override getDisplayName(): string {
        return "Revolutionary Fervor";
    }

    override getDescription(): string {
        return `Whenever an ally dies, gain +${this.getStacksDisplayText()} Lethality.`;
    }

    override onEvent(event: AbstractCombatEvent): void {
        if (event instanceof CharacterDeathEvent){
            const owner = this.getOwnerAsCharacter();
            if (owner && event.deadCharacter.team === owner.team && event.deadCharacter !== owner){
                this.actionManager.applyBuffToCharacter(owner, new Lethality(this.stacks));
            }
        }
    }
}
