import { BaseCharacter } from "../../BaseCharacter";
import { LocationCardBuff } from "../LocationCardBuff";
import { EldritchHorror } from "../standard/EldritchHorror";

export class EldritchFoes extends LocationCardBuff {
    constructor() {
        super();
    }

    override getName(): string {
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
