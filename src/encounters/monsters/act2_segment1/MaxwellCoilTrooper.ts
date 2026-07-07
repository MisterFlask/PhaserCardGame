import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Robotic } from "../../../gamecharacters/buffs/enemy_buffs/Robotic";
import { Frostbite } from "../../../gamecharacters/buffs/standard/Frostbite";

export class MaxwellCoilTrooper extends AutomatedCharacter {
    constructor() {
        super({
            name: "Maxwell-Coil Trooper",
            portraitName: "veil-capacitor",
            maxHitpoints: 75,
            description: "Reichsinfernokorps cryo-infantry, insulated head to boot in rubberised coilwrap and powered by a backpack generator that hums a full tone flatter than is comfortable to stand near. The coil earths most of what you throw at him before it can properly land - the first two curses I saw Morrison attempt simply arced off into the mud. Liberation, he explained, requires a certain robustness of constitution. I did not ask whether he meant his own."
        });
        this.buffs.push(new Robotic(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 9, owner: this }).withTitle('Frost Bayonet'),
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Frostbite(1), owner: this }).withTitle('Frost Bayonet')
            ],
            [
                new BlockForSelfIntent({ blockAmount: 10, owner: this }).withTitle('Earth The Coil')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
