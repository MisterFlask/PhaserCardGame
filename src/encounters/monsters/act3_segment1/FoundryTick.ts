import { AbstractIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { LeechingBite } from "../../../gamecharacters/buffs/enemy_buffs/LeechingBite";
import { ToxicRetaliation } from "../../../gamecharacters/buffs/enemy_buffs/ToxicRetaliation";

export class FoundryTick extends AutomatedCharacter {
    constructor() {
        super({
            name: "Foundry Tick",
            portraitName: "symbol_tick",
            maxHitpoints: 38,
            description: "Lives in the wall cavities and feeds, near as the Stokers can tell, on whatever's warmest - blood first, then heat, then apparently our patience. Bites and grows fat on the proceeds, and any blade left in it long enough comes back poisoned for the trouble, which the men here regard as the tick's one redeeming quality. The Barons class it as vermin. The Union, with evident relish, classes it as management."
        });
        this.buffs.push(new LeechingBite(4));
        this.buffs.push(new ToxicRetaliation(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        return [ new AttackIntent({ baseDamage: 7, owner: this }).withTitle('Latch On') ];
    }
}
