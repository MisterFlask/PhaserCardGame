import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { AbstractBuff } from "../../../gamecharacters/buffs/AbstractBuff";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";
import { ActionManager } from "../../../utils/ActionManager";
import { DamageInfo } from "../../../rules/DamageInfo";

class Entrench extends AbstractBuff {
    readonly strengthGain: number;

    constructor(blockAmount: number = 6, strengthGain: number = 1) {
        super();
        this.isDebuff = false;
        this.imageName = "buff-shield";
        this.stacks = blockAmount;
        this.secondaryStacks = 0; // 0 = not struck this turn
        this.strengthGain = strengthGain;
    }

    override getDisplayName(): string {
        return "Entrench";
    }

    override getDescription(): string {
        return `If unhurt this turn, gain ${this.stacks} Block and ${this.strengthGain} Strength at end of turn.`;
    }

    override onTurnStart(): void {
        this.secondaryStacks = 0;
    }

    override onOwnerStruck_CannotModifyDamage(_striker: any, _card: any, _info: DamageInfo): void {
        this.secondaryStacks = 1;
    }

    override onTurnEnd(): void {
        if (this.secondaryStacks === 0) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                ActionManager.getInstance().applyBlock({ baseBlockValue: this.stacks, blockSourceCharacter: owner, blockTargetCharacter: owner });
                ActionManager.getInstance().applyBuffToCharacterOrCard(owner, new Lethality(this.strengthGain));
            }
        }
    }
}

export class TrenchEngineer extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Trench Engineer',
            portraitName: 'Napoleonic Zombie',
            maxHitpoints: 80,
            description: "A sapper, dead these many years, who has not been informed of the fact and continues fortifying regardless. Leave him unmolested for even a turn and he'll have sandbags stacked to the chin and his strength quietly doubled before you've noticed the shovel moving; strike him and the work stops, briefly, while he remembers he's under attack. Methodical to a fault - I suspect he was an insufferable colleague even before he died."
        });
        this.buffs.push(new Entrench());
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 8, owner: this }).withTitle('Bayonet Jab'),
                new BlockForSelfIntent({ blockAmount: 6, owner: this }).withTitle('Sandbag Wall')
            ],
            [
                new AttackIntent({ baseDamage: 14, owner: this }).withTitle('Shrapnel Charge')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
