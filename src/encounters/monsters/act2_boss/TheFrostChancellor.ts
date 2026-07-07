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
            description: "Reichsinfernokorps, and ranking, by the quantity of frost-crusted braid on him. Berlin's cryo-troops were bred for the cold, we're told, but this one seems to have gone rather further than bred for it - the air around him thickens and stalls the moment he raises his voice, and I watched a man's canteen freeze solid at thirty paces during what I can only describe as a mild administrative announcement. He arrived, he informed us, to liberate the trenches from Bonapartiste tyranny. The trenches did not look liberated. They looked, if anything, considerably colder."
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
