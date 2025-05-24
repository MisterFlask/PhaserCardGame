import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "../standard/Lethality";

export class Foreseen extends AbstractBuff {
    public imageName: string = "eyeball";
    private readonly name: string = "Foreseen";
    private readonly description: string = "When this card is played, increases the strength of all enemies by [stacks].";

    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
        this.imageName = "eyeball";
    }

    getDisplayName(): string {
        return this.name;
    }

    getDescription(): string {
        return this.description.replace("[stacks]", this.stacks.toString());
    }

    override onThisCardInvoked(): void {
        const owner = this.getOwnerAsPlayableCard();
        if (!owner) return;

        const combatState = this.gameState.combatState;
        combatState.enemies.forEach((enemy: BaseCharacter) => {
            this.actionManager.applyBuffToCharacterOrCard(enemy, new Lethality(this.stacks));
        });
    }

} 