import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { TariffAura } from "../../../gamecharacters/buffs/enemy_buffs/TariffAura";

export class MaisonVachonQuartermaster extends AutomatedCharacter {
    constructor() {
        super({
            name: "Maison Vachon Quartermaster",
            portraitName: "capitalist_1",
            maxHitpoints: 115,
            description: "Officially a caterer; unofficially the reason this front has stayed fed, watered, and financially embarrassed for going on four decades. He runs the mess contract like an occupying power in miniature, and had the gall to invoice us for the privilege of being shot at near his cart. Every so often he'll eye a man's kit and simply decide something in it has appreciated - a toll, he called it, apologetically, while doubling the price of the nearest card in your hand."
        });
        this.buffs.push(new TariffAura());
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new BlockForSelfIntent({ blockAmount: 14, owner: this }).withTitle('Fortify The Cart')
            ],
            [
                new AttackIntent({ baseDamage: 13, owner: this }).withTitle('Cleaver')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
