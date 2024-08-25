class BaseCharacterClass {
    constructor({ name, iconName }: { name: string; iconName: string }) {
        this.name = name
        this.iconName = iconName
        this.availableCards = []
    }

    name: string
    iconName: string
    availableCards: BaseCardBehavior[]

    addCard(card: BaseCardBehavior) {
        this.availableCards.push(card)
    }
}

class BlackhandClass extends BaseCharacterClass {
    constructor() {
        super({ name: "Blackhand", iconName: "blackhand_icon" })
        // Add Blackhand-specific cards here
        this.addCard(new FireballCard())
        this.addCard(new ToxicCloudCard())
    }
}

class DiabolistClass extends BaseCharacterClass {
    constructor() {
        super({ name: "Diabolist", iconName: "diabolist_icon" })
        // Add Diabolist-specific cards here
        this.addCard(new ArcaneRitualCard())
        this.addCard(new SummonDemonCard())
    }
}

interface CardData {
    name: string;
    description: string;
    cardType: CardType;
    portraitName: string;
}

enum CardType{
    CHARACTER = "CHARACTER",
    PLAYABLE = "PLAYABLE"
}

class BaseCardBehavior implements CardData {
    name: string
    description: string
    portraitName: string
    cardType: CardType

    constructor({ name, description, portraitName, cardType }: { name: string; description: string; portraitName?: string, cardType?: CardType }) {
        this.name = name
        this.description = description
        this.portraitName = portraitName || "flamer1"
        this.cardType = cardType || CardType.PLAYABLE
    }
}


class ArcaneRitualCard extends BaseCardBehavior {
    constructor() {
        super({
            name: "Arcane Ritual",
            description: "Draw 2 cards. Discard 1 card.",
            portraitName: "gem-pendant"
        });
    }
}
class FireballCard extends BaseCardBehavior {
    constructor() {
        super({
            name: "Fireball",
            description: "Deal 6 damage to target enemy.",
            portraitName: "fire"
        });
    }
}

class ToxicCloudCard extends BaseCardBehavior {
    constructor() {
        super({
            name: "Toxic Cloud",
            description: "Apply 3 Poison to all enemies.",
            portraitName: "smog-grenade"
        });
    }
}

class SummonDemonCard extends BaseCardBehavior {
    constructor() {
        super({
            name: "Summon Demon",
            description: "Summon a 5/5 Demon minion.",
            portraitName: "skull-bolt"
        });
    }
}