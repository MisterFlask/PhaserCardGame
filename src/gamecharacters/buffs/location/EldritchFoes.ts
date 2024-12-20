import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";
import { EldritchHorror } from "../standard/EldritchHorror";

export class EldritchFoes extends AbstractBuff {
    constructor() {
        super();
    }

    override getDisplayName(): string {
        return "Interdimensional Seepage";
    }

    override getDescription(): string {
        return "All enemies start combat with Eldritch Horror.";
    }

    override onCombatStart(): void {
        this.forEachEnemy((enemy: BaseCharacter) => {
            this.actionManager.applyBuffToCharacterOrCard(enemy, new EldritchHorror());
        });
    }
}
