import { AbstractIntent, AttackAllPlayerCharactersIntent, ApplyDebuffToAllPlayerCharactersIntent, DoSomethingIntent, ApplyBuffToAllEnemyCharactersIntent, IntentListCreator, SummonIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Terrifying } from "../../../gamecharacters/buffs/standard/Terrifying";
import { GrowingPowerBuff } from "../../../gamecharacters/buffs/standard/GrowingPower";
import { StunnedBuff } from "../../../gamecharacters/buffs/playable_card/Stunned";
import { Hazardous } from "../../../gamecharacters/buffs/playable_card/Hazardous";
import { ValuableCargo } from "../../../gamecharacters/buffs/standard/ValuableCargo";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";
import { WildcatStriker } from "../act3_segment1/WildcatStriker";
import { GameState } from "../../../rules/GameState";
import { CardSize } from "../../../gamecharacters/Primitives";

export class TheRevolutionary extends AutomatedCharacter {
    constructor(){
        super({
            name: 'Union Leader',
            portraitName: 'angry-worker-boss',
            maxHitpoints: 280,
            description: "Fires the workers' fury."
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new Terrifying(2));
        this.buffs.push(new GrowingPowerBuff(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const striker1 = new WildcatStriker(); striker1.maxHitpoints = 30; striker1.hitpoints = 30;
        const striker2 = new WildcatStriker(); striker2.maxHitpoints = 30; striker2.hitpoints = 30;
        const intents: AbstractIntent[][] = [
            [
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new StunnedBuff(1), owner: this }).withTitle('General Strike'),
                new AttackAllPlayerCharactersIntent({ baseDamage: 12, owner: this }).withTitle('General Strike')
            ],
            [
                new DoSomethingIntent({
                    owner: this,
                    imageName: 'hazard',
                    action: () => {
                        const state = GameState.getInstance();
                        const cards = [...state.combatState.drawPile, ...state.combatState.currentDiscardPile];
                        cards.forEach(card => {
                            if (card.buffs.some(b => b instanceof ValuableCargo)) {
                                this.actionManager.applyBuffToCard(card, new Hazardous(4));
                            }
                        });
                    }
                }).withTitle('Seize the Means')
            ],
            [
                new ApplyBuffToAllEnemyCharactersIntent({ debuff: new Lethality(6), owner: this }).withTitle('Class Consciousness')
            ],
            [
                new SummonIntent({ monsterToSummon: striker1, owner: this }).withTitle('Rouse The Masses'),
                new SummonIntent({ monsterToSummon: striker2, owner: this }).withTitle('Rouse The Masses')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
