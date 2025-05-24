import { AbstractIntent, DoSomethingIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Prophet } from '../../../gamecharacters/buffs/enemy_buffs/Prophet';
import { HarbingerOfFate } from '../../../gamecharacters/buffs/enemy_buffs/HarbingerOfFate';
import { Lethality } from '../../../gamecharacters/buffs/standard/Lethality';
import { Cursed } from '../../../gamecharacters/buffs/standard/Cursed';
import { Stress } from '../../../gamecharacters/buffs/standard/Stress';
import { CardSize } from '../../../gamecharacters/Primitives';
import { GameState } from '../../../rules/GameState';
import { TargetingUtils } from '../../../utils/TargetingUtils';

export class HermitProphetOfTheDelta extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Hermit Prophet',
            portraitName: 'hermit',
            maxHitpoints: 220,
            description: 'A reclusive seer touched by dark tides.'
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new Prophet(2));
        this.buffs.push(new HarbingerOfFate());
    }

    get fateBuff(): HarbingerOfFate | undefined {
        return this.buffs.find(b => b instanceof HarbingerOfFate) as HarbingerOfFate;
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [new DoSomethingIntent({
                owner: this,
                imageName: 'knife-thrust',
                action: () => {
                    const target = TargetingUtils.getInstance().selectRandomPlayerCharacter();
                    this.actionManager.dealDamage({ baseDamageAmount: 20, target, sourceCharacter: this });
                    if (this.fateBuff && this.fateBuff.hasPlayedForeseen(target)) {
                        this.actionManager.applyBuffToCharacter(target, new Stress(3));
                    }
                }
            }).withTitle('Prophecy Fulfilled')],
            [new DoSomethingIntent({
                owner: this,
                imageName: 'knife-thrust',
                action: () => {
                    const target = TargetingUtils.getInstance().selectRandomPlayerCharacter();
                    this.actionManager.dealDamage({ baseDamageAmount: 18, target, sourceCharacter: this });
                    this.actionManager.applyBuffToCharacter(target, new Cursed(2));
                }
            }).withTitle('Inevitability')],
            [new DoSomethingIntent({
                owner: this,
                imageName: 'round-shield',
                action: () => {
                    this.actionManager.applyBlock({ baseBlockValue: 30, blockSourceCharacter: this, blockTargetCharacter: this });
                    this.actionManager.applyBuffToCharacter(this, new Lethality(2));
                }
            }).withTitle('Path To Victory')]
        ];
        return intents[GameState.getInstance().combatState.currentTurn % intents.length];
    }
}
