import { EntityRarity } from '../../gamecharacters/PlayableCard';
import { ManufactureEvent } from '../../gamecharacters/procs/BasicProcs';
import { AbstractCombatEvent } from '../../rules/AbstractCombatEvent';
import { AbstractRelic } from '../AbstractRelic';

export class StovepipeHat extends AbstractRelic {
    constructor() {
        super();
        this.name = 'Smog Manufacturer';
        this.description = 'Whenever you manufacture a card, gain 1 Smog.';
        this.rarity = EntityRarity.RARE;
    }

    override onCombatEvent(event: AbstractCombatEvent): void {
        if (event instanceof ManufactureEvent) {
            this.actionManager.modifySmog(1);
        }
    }
}
