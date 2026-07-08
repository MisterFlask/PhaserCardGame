import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { TariffAura } from "../../../gamecharacters/buffs/enemy_buffs/TariffAura";
import { DrawOneFewerCardNextNTurns } from "../../../gamecharacters/buffs/standard/DrawOneFewerCardNextNTurns";

// TariffAura idiom reused verbatim (a random hand card costs 1 more each
// turn); draw-denial idiom reused verbatim from Company Bailiff (act 3).
// HP band: Company Bailiff (88) + ~20% ≈ 106.
export class BaronsAssessor extends AutomatedCharacter {
    constructor() {
        super({
            name: "Baron's Assessor",
            portraitName: "",
            maxHitpoints: 106,
            description: "Cavendish survey note: arrived with a levy schedule and a clerk to carry it, and informed the party we were operating within the Barons' claimed tariff zone without a permit on file. The remedy, he explained at length, is an assessment - applied, apparently, at his sole discretion and to whichever of our resources he judges undertaxed. He also took a keen interest in how quickly we could muster our hands, and saw fit to slow that too, for what he called 'administrative parity.'"
        });
        this.buffs.push(new TariffAura());
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [ new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new DrawOneFewerCardNextNTurns(1), owner: this }).withTitle('Administrative Parity') ],
            [ new AttackIntent({ baseDamage: 17, owner: this }).withTitle('Levy Enforcement') ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}
