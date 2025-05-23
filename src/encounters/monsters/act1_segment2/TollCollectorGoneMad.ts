import { AbstractIntent, AttackIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { TariffAura } from '../../../gamecharacters/buffs/enemy_buffs/TariffAura';
import { CardSize } from '../../../gamecharacters/Primitives';
import { TargetingUtils } from '../../../utils/TargetingUtils';

export class TollCollectorGoneMad extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Mad Toll Collector',
            portraitName: 'Lost Accountant',
            maxHitpoints: 28,
            description: 'Ink-stained revenant shrieking about unpaid fares.'
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new TariffAura());
    }

    override generateNewIntents(): AbstractIntent[] {
        return [new AttackIntent({ baseDamage: 6, owner: this, target: TargetingUtils.getInstance().selectRandomPlayerCharacter() }).withTitle('Ledger Smash')];
    }
}
