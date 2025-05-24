import { AbstractIntent, AttackAllPlayerCharactersIntent, ApplyBuffToSelfIntent, DoSomethingIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { GreedIncarnate } from '../../../gamecharacters/buffs/enemy_buffs/GreedIncarnate';
import { Lethality } from '../../../gamecharacters/buffs/standard/Lethality';
import { Hazardous } from '../../../gamecharacters/buffs/playable_card/Hazardous';
import { ValuableCargo } from '../../../gamecharacters/buffs/standard/ValuableCargo';
import { CardSize } from '../../../gamecharacters/Primitives';
import { GameState } from '../../../rules/GameState';

export class BloatedTreasurer extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Bloated Treasurer',
            portraitName: 'Lost Accountant',
            maxHitpoints: 200,
            description: 'corpulent guardian of illicit wealth'
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new GreedIncarnate());
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [new AttackAllPlayerCharactersIntent({ baseDamage: 6, owner: this }).withTitle('Squeeze Dry')],
            [new ApplyBuffToSelfIntent({ buff: new Lethality(4), owner: this }).withTitle('Inflation')],
            [new DoSomethingIntent({
                owner: this,
                imageName: 'round-shield',
                action: () => {
                    this.actionManager.applyBlock({ baseBlockValue: 15, blockSourceCharacter: this, blockTargetCharacter: this });
                    const state = GameState.getInstance();
                    const cards = [...state.combatState.drawPile, ...state.combatState.currentDiscardPile];
                    cards.forEach(card => {
                        if (card.buffs.some(b => b instanceof ValuableCargo)) {
                            this.actionManager.applyBuffToCard(card, new Hazardous(2));
                        }
                    });
                }
            }).withTitle('Undeclared Goods')]
        ];

        return intents[GameState.getInstance().combatState.currentTurn % intents.length];
    }
}
