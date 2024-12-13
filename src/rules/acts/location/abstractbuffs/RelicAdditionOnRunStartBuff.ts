import { AbstractBuff } from "../../../../gamecharacters/buffs/AbstractBuff";
import { AbstractRelic } from "../../../../relics/AbstractRelic";
import { TornPage } from "../../../../relics/common/TornPage";
import { ActionManager } from "../../../../utils/ActionManager";

export class RelicAdditionOnRunStartBuff extends AbstractBuff {
    private relic: AbstractRelic;
    constructor(relic: AbstractRelic) {
        super();
        this.relic = relic;
    }

    override onRunStart(): void {
        ActionManager.getInstance().addRelicToInventory(new TornPage());
    }

    override getDisplayName(): string {
        return `Start With A ${this.relic.getDisplayName()}`;
    }

    override getDescription(): string {
        return this.relic.getDescription();
    }
}
