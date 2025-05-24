import { AbstractIntent, AttackAllPlayerCharactersIntent, ApplyBuffToAllEnemyCharactersIntent, ApplyDebuffToAllPlayerCharactersIntent, IntentListCreator, SummonIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { GrandArmeeEternal } from '../../../gamecharacters/buffs/enemy_buffs/GrandArmeeEternal';
import { Decaying } from '../../../gamecharacters/buffs/enemy_buffs/Decaying';
import { Lethality } from '../../../gamecharacters/buffs/standard/Lethality';
import { Vulnerable } from '../../../gamecharacters/buffs/standard/Vulnerable';
import { OldGuardGrenadier } from '../act2_segment1/OldGuardGrenadier';
import { CardSize } from '../../../gamecharacters/Primitives';

export class MarshalMortis extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Marshal Mortis',
            portraitName: 'Napoleonic Zombie',
            maxHitpoints: 280,
            description: 'undying master of the imperial legions'
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new GrandArmeeEternal());
    }

    override generateNewIntents(): AbstractIntent[] {
        const g1 = new OldGuardGrenadier(); g1.maxHitpoints = 40; g1.hitpoints = 40;
        const g2 = new OldGuardGrenadier(); g2.maxHitpoints = 40; g2.hitpoints = 40;
        const intents: AbstractIntent[][] = [
            [
                new SummonIntent({ monsterToSummon: g1, owner: this }).withTitle('Send In The Next Wave'),
                new SummonIntent({ monsterToSummon: g2, owner: this }).withTitle('Send In The Next Wave')
            ],
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 15, owner: this }).withTitle('Artillery Barrage'),
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Vulnerable(1), owner: this }).withTitle('Artillery Barrage')
            ],
            [
                new ApplyBuffToAllEnemyCharactersIntent({ debuff: new Lethality(4), owner: this }).withTitle("Vive L'Empereur"),
                new ApplyBuffToAllEnemyCharactersIntent({ debuff: new Decaying(1), owner: this }).withTitle("Vive L'Empereur")
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
