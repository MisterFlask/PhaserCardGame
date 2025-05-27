import { AbstractIntent, ApplyBuffToSelfIntent, AttackAllPlayerCharactersIntent, DoSomethingIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { GreedIncarnate } from '../../../gamecharacters/buffs/enemy_buffs/GreedIncarnate';
import { Hazardous } from '../../../gamecharacters/buffs/playable_card/Hazardous';
import { Lethality } from '../../../gamecharacters/buffs/standard/Lethality';
import { Titan } from '../../../gamecharacters/buffs/standard/Titan';
import { ValuableCargo } from '../../../gamecharacters/buffs/standard/ValuableCargo';
import { CardSize } from '../../../gamecharacters/Primitives';
import { GameState } from '../../../rules/GameState';

export class BloatedTreasurer extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Bloated Treasurer',
            portraitName: 'Lost Accountant',
            maxHitpoints: 200,
            description: "God in Heaven. We thought the tollhouse abandoned until we heard the counting. Found him in the vault - or what's left of him. The Treasurer, they called him, still at his desk after all these years. Swollen with marsh gas or worse, fingers still tallying coins that turned to rust decades ago. He spoke in numbers, demanding fees in currencies I'd never heard of. \n\n When we couldn't pay, he rose from his desk - Christ, the smell - and pursued us through the ruins. Moved faster than anything that bloated had a right to. We barely escaped, and only because Morrison threw his purse into the bog."
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new GreedIncarnate());
        this.buffs.push(new Titan(2));
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
