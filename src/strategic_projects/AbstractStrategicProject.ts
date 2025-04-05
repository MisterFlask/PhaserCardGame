import { AbstractCard } from "../gamecharacters/AbstractCard";

import { Team } from "../gamecharacters/AbstractCard";
import { CardType } from "../gamecharacters/Primitives";

export abstract class AbstractStrategicProject extends AbstractCard {
    constructor({ name, description, portraitName }: { name: string; description: string; portraitName?: string }) {
        super({
            name,
            description,
            portraitName,
            cardType: CardType.SKILL,
            team: Team.ALLY
        });
    }
}
