import { AbstractIntent, BlockForSelfIntent, DoSomethingIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { CardSize } from '../../../gamecharacters/Primitives';

export class HermitsTreasure extends AutomatedCharacter {
    private turnCount: number = 0;

    constructor() {
        super({
            name: 'Hermit\'s Treasure',
            portraitName: 'treasure',
            maxHitpoints: 100,
            description: 'A chest of unknown value.'
        });
        this.size = CardSize.LARGE;
    }

    override generateNewIntents(): AbstractIntent[] {
        this.turnCount++;
        if (this.turnCount <= 3) {
            return [new BlockForSelfIntent({ blockAmount: 10, owner: this }).withTitle('Guard Treasure')];
        }
        return [new DoSomethingIntent({
            owner: this,
            imageName: 'running-ninja',
            action: () => {
                this.hitpoints = 0;
            }
        }).withTitle('Flee')];
    }
}
