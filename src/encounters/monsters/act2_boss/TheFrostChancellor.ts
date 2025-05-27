import { AbstractIntent, AddCardToPileIntent, ApplyBuffToSelfIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { AbsoluteZeroDoctrine } from '../../../gamecharacters/buffs/enemy_buffs/AbsoluteZeroDoctrine';
import { Armored } from '../../../gamecharacters/buffs/standard/Armored';
import { Frostbite } from '../../../gamecharacters/buffs/standard/Frostbite';
import { Lethality } from '../../../gamecharacters/buffs/standard/Lethality';
import { LoomingBlizzard } from '../../../gamecharacters/playerclasses/cards/other/tokens/LoomingBlizzard';
import { CardSize } from '../../../gamecharacters/Primitives';

export class TheFrostChancellor extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Frost Chancellor',
            portraitName: 'frost_knight',
            maxHitpoints: 250,
            description: 'brings icy death to the unprepared'
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new Armored(5));
        this.buffs.push(new AbsoluteZeroDoctrine());
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AddCardToPileIntent({ cardToAdd: new LoomingBlizzard(), pileName: 'hand', owner: this }).withTitle('Commadore Snow')
            ],
            [
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Frostbite(1), owner: this }).withTitle('Ice Age Protocol'),
                new BlockForSelfIntent({ blockAmount: 20, owner: this }).withTitle('Ice Age Protocol'),
                new ApplyBuffToSelfIntent({ buff: new Lethality(5), owner: this }).withTitle('Ice Age Protocol')
            ],
            [
                new AttackIntent({ baseDamage: 15, owner: this }).withTitle('Shatter'),
                new AttackIntent({ baseDamage: 15, owner: this }).withTitle('Shatter')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
