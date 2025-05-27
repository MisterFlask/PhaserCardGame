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
            description: "At the old toll station, we found him - still at his post after God knows how long. Demanding payment in currencies that no longer exist, consulting rate tables eaten by damp. His eyes never focused on us, just through us, seeing travelers long dead perhaps. We had to pay him in buttons and lint before he'd raise the barrier."
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new TariffAura());
    }

    override generateNewIntents(): AbstractIntent[] {
        return [new AttackIntent({ baseDamage: 6, owner: this, target: TargetingUtils.getInstance().selectRandomPlayerCharacter() }).withTitle('Ledger Smash')];
    }
}
