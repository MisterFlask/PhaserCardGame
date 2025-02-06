import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { ManufactureEvent } from '../../gamecharacters/procs/BasicProcs';
import { AbstractCombatEvent } from '../../rules/AbstractCombatEvent';
import { AbstractRelic } from '../AbstractRelic';

export class StovepipeHat extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.RARE;
    }

    getDisplayName(): string {
        return 'Stovepipe Hat';
    }

    getDescription(): string {
        return 'Whenever you manufacture a card, gain 1 Smog.';
    }

    override onEvent(event: AbstractCombatEvent) {
        if (event instanceof ManufactureEvent) {
            this.actionManager.modifySmog(1);
        }
        return undefined;
    }
}
