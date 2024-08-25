import { AbstractCard } from "./PhysicalCard";

export class BaseCharacter{
    name: string;
    portraitName: string;
    characterClass: BaseCharacterClass;
    

    constructor({ name, portraitName, characterClass }: { name: string; portraitName: string; characterClass: BaseCharacterClass }) {
        this.name = name;
        this.portraitName = portraitName;
        this.characterClass = characterClass;
    }
}


export class BaseCharacterClass {
    constructor({ name, iconName }: { name: string; iconName: string }) {
        this.name = name
        this.iconName = iconName
        this.availableCards = []
    }

    name: string
    iconName: string
    availableCards: AbstractCard[]

    addCard(card: AbstractCard) {
        this.availableCards.push(card)
    }
}

export class BlackhandClass extends BaseCharacterClass {
    constructor() {
        super({ name: "Blackhand", iconName: "blackhand_icon" })
        // Add Blackhand-specific cards here
        this.addCard(new FireballCard())
        this.addCard(new ToxicCloudCard())
    }
}

export class DiabolistClass extends BaseCharacterClass {
    constructor() {
        super({ name: "Diabolist", iconName: "diabolist_icon" })
        // Add Diabolist-specific cards here
        this.addCard(new ArcaneRitualCard())
        this.addCard(new SummonDemonCard())
    }
}


export class ArcaneRitualCard extends AbstractCard {
    constructor() {
        super({
            name: "Arcane Ritual",
            description: "Draw 2 cards. Discard 1 card.",
            portraitName: "gem-pendant"
        });
    }
}
export class FireballCard extends AbstractCard {
    constructor() {
        super({
            name: "Fireball",
            description: "Deal 6 damage to target enemy.",
            portraitName: "fire"
        });
    }
}

export class ToxicCloudCard extends AbstractCard {
    constructor() {
        super({
            name: "Toxic Cloud",
            description: "Apply 3 Poison to all enemies.",
            portraitName: "smog-grenade"
        });
    }
}

export class SummonDemonCard extends AbstractCard {
    constructor() {
        super({
            name: "Summon Demon",
            description: "Summon a 5/5 Demon minion.",
            portraitName: "skull-bolt"
        });
    }
}