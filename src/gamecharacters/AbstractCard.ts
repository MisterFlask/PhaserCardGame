import { GameAction } from "../utils/ActionManager"
import { CardType, CardSize, generateWordGuid, PhysicalCard } from "./PhysicalCard"

export class AbstractCard {
    public name: string
    public description: string
    public portraitName: string
    cardType: CardType
    public tooltip: string
    characterData: BaseCharacter | null
    size: CardSize
    id: string = generateWordGuid()
    physicalCard: PhysicalCard | null = null

    constructor({ name, description, portraitName, cardType, tooltip, characterData, size }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string, characterData?: BaseCharacter, size?: CardSize }) {
        this.name = name
        this.description = description
        this.portraitName = portraitName || "flamer1"
        this.cardType = cardType || CardType.PLAYABLE
        this.tooltip = tooltip || "Lorem ipsum dolor sit amet"
        this.characterData = characterData || null
        this.size = size || CardSize.SMALL
    }

    IsPerformableOn(targetCard: PhysicalCard) {
        if (this.cardType == CardType.PLAYABLE) {
            return false
        }
        return true
    }


    OnCombatStart(): GameAction[] {
        console.log('Combat started');
        return [];
    }

    PlayCard(targetCard?: PhysicalCard) : GameAction[] {
        console.log("Action performed on " + targetCard?.data?.name + " by  " + this.name)
        return [];
    }

    Copy(): AbstractCard {
        return new AbstractCard({
            name: this.name,
            description: this.description,
            portraitName: this.portraitName,
            cardType: this.cardType,
            tooltip: this.tooltip,
            size: this.size,
            characterData: this.characterData || undefined
        });
    }
}

export class BaseCharacter extends AbstractCard{
    name: string;
    portraitName: string;
    hitpoints: number;
    maxHitpoints: number;

    constructor({ name, portraitName, maxHitpoints, description }
        : { name: string; portraitName: string; maxHitpoints: number; description?: string}) {
        super({
            name: name,
            description: description || "",
            portraitName: portraitName
        });
        this.name = name;
        this.portraitName = portraitName;
        this.maxHitpoints = maxHitpoints;
        this.hitpoints = maxHitpoints;
    }
}
