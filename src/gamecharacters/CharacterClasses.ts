import { AbstractCard } from "./PhysicalCard";

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

export class BaseCharacterClass {
    constructor({ name, iconName, startingMaxHp }: { name: string; iconName: string, startingMaxHp: number }) {
        this.name = name
        this.iconName = iconName
        this.availableCards = []
        this.startingMaxHp = startingMaxHp
    }

    name: string
    iconName: string
    availableCards: AbstractCard[]
    startingMaxHp: number

    addCard(card: AbstractCard) {
        this.availableCards.push(card)
    }

    createCharacterFromClass(){
        return new PlayerCharacter({ name: this.name, portraitName: this.iconName, characterClass: this })
    }
}

export class PlayerCharacter extends BaseCharacter {
    cardsInDeck: AbstractCard[];
    characterClass: BaseCharacterClass;
    
    constructor({ name, portraitName, characterClass, description }
        : {name: string; portraitName: string; characterClass: BaseCharacterClass, description?: string}) {
        super({ name, portraitName, maxHitpoints: characterClass.startingMaxHp, description })
        this.cardsInDeck = [];
        this.hitpoints = characterClass.startingMaxHp;
        this.maxHitpoints = characterClass.startingMaxHp;
        this.characterClass = characterClass;
    }
}

export class EnemyCharacter extends BaseCharacter {

    constructor({ name, portraitName, description, maxHitpoints }
        : {name: string; portraitName: string; description?: string; maxHitpoints: number}) {
        super({ name: name, portraitName: portraitName, maxHitpoints: maxHitpoints, description: description })
    }
}


export class GoblinCharacter extends EnemyCharacter {
    constructor() {
        super({ name: "Goblin", portraitName: "flamer1", maxHitpoints: 10, description: "A small, mischievous creature" })
    }
}

export class BlackhandClass extends BaseCharacterClass {
    constructor() {
        super({ name: "Blackhand", iconName: "blackhand_icon", startingMaxHp: 30 })
        // Add Blackhand-specific cards here
        this.addCard(new FireballCard())
        this.addCard(new ToxicCloudCard())
    }
}

export class DiabolistClass extends BaseCharacterClass {
    constructor() {
        super({ name: "Diabolist", iconName: "diabolist_icon", startingMaxHp: 20 })
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