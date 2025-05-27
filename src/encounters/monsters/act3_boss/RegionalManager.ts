import { AbstractIntent, AttackAllPlayerCharactersIntent, DoSomethingIntent, IntentListCreator, SummonIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Armored } from "../../../gamecharacters/buffs/standard/Armored";
import { GrowingPowerBuff } from "../../../gamecharacters/buffs/standard/GrowingPower";
import { ExhaustBuff } from "../../../gamecharacters/buffs/playable_card/ExhaustBuff";
import { ProductionQuota } from "../../../gamecharacters/buffs/enemy_buffs/ProductionQuota";
import { CompanyOverseer } from "../act3_segment1/CompanyOverseer";
import { GameState } from "../../../rules/GameState";
import { CardSize } from "../../../gamecharacters/Primitives";

export class RegionalManager extends AutomatedCharacter {
    private reorgTriggered: boolean = false;
    constructor(){
        super({
            name: 'Regional Manager',
            portraitName: 'manager-demon',
            maxHitpoints: 320,
            description: 'Brimstone Baron of infernal industry.'
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new Armored(4));
        this.buffs.push(new GrowingPowerBuff(3));
        this.buffs.push(new ProductionQuota());
    }

    override generateNewIntents(): AbstractIntent[] {
        if(!this.reorgTriggered && this.hitpoints <= this.maxHitpoints / 2){
            const o1 = new CompanyOverseer(); o1.maxHitpoints = 50; o1.hitpoints = 50;
            const o2 = new CompanyOverseer(); o2.maxHitpoints = 50; o2.hitpoints = 50;
            this.reorgTriggered = true;
            return [
                new SummonIntent({ monsterToSummon: o1, owner: this }).withTitle('Surprise Reorg'),
                new SummonIntent({ monsterToSummon: o2, owner: this }).withTitle('Surprise Reorg')
            ];
        }

        const intents: AbstractIntent[][] = [
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 25, owner: this }).withTitle('Gold Rush')
            ],
            [
                new DoSomethingIntent({
                    owner: this,
                    imageName: 'card-burn',
                    action: () => {
                        const state = GameState.getInstance();
                        const topCards = state.combatState.drawPile.slice(0, 4);
                        topCards.forEach(card => {
                            this.actionManager.applyBuffToCard(card, new ExhaustBuff());
                        });
                        this.actionManager.applyBlock({ baseBlockValue: 20, blockSourceCharacter: this, blockTargetCharacter: this });
                    }
                }).withTitle('Deadline Pressure')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
