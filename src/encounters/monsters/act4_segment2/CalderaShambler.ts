import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Burning } from "../../../gamecharacters/buffs/standard/Burning";
import { Armored } from "../../../gamecharacters/buffs/standard/Armored";
import { CardSize } from "../../../gamecharacters/Primitives";

// "Frostbite-inverse": Frostbite is a cold-themed debuff (Dexterity/Lethality
// down); its thematic inverse for a volcanic body is heat, so this reuses the
// existing Burning stack idiom (the same burn-stack class Molten Agitator
// applies in act 3) rather than inventing a new buff class. HP band: the
// segment's designated sponge, set above act-3 segment-2's heaviest single
// body (Ironclad Picket, 120) + ~20% headroom on top of that ceiling ≈ 150.
export class CalderaShambler extends AutomatedCharacter {
    constructor() {
        super({
            name: "Caldera Shambler",
            portraitName: "caldera-shambler",
            maxHitpoints: 150,
            description: "Cavendish survey note: a slag-crusted bulk that appears to have congealed, rather than been born, somewhere at the caldera's rim, and moves at a pace that makes 'shambler' feel generous rather than accurate. Its crust holds heat the way a kiln holds heat, and it sheds a good deal of that heat onto whoever gets close enough to strike it - Morrison's coat is still smouldering, three days on. Slow, armoured, and in absolutely no hurry, which is somehow the most alarming quality of the three."
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new Armored(4));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 16, owner: this }).withTitle('Slag Crush'),
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Burning(2), owner: this })
            ],
            [ new AttackIntent({ baseDamage: 22, owner: this }).withTitle('Caldera Roll') ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
