import { ActionManager } from "../utils/ActionManager"
import { AbstractCard, PlayableCard } from "./AbstractCard"
import { AbstractIntent, AttackIntent } from "./AbstractIntent"
import { AutomatedCharacter } from "./AutomatedCharacter"
import { BaseCharacter } from "./BaseCharacter"
import {  BaseCharacterClass } from "./CharacterClasses"

export class GoblinCharacter extends AutomatedCharacter {
    constructor() {
        super({ name: "Goblin", portraitName: "flamer1", maxHitpoints: 10, description: "A small, mischievous creature" })
    }
    generateNewIntents(): AbstractIntent[] {
        return [new AttackIntent({owner: this, damage: 1})];
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


export class ArcaneRitualCard extends PlayableCard {
    constructor() {
        super({
            name: "Arcane Ritual",
            description: "Deal 4 damage to target enemy. Draw 1 card.",
            portraitName: "gem-pendant"
        });
    }

    IsPerformableOn = (targetCard: AbstractCard): boolean => {
        return targetCard instanceof AutomatedCharacter;
    }

    InvokeCardEffects = (targetCard?: AbstractCard): void => {
        if (targetCard && targetCard instanceof BaseCharacter) {
            ActionManager.getInstance().dealDamage({ target: targetCard, amount: 4 });
            console.log(`Dealt 4 damage to ${targetCard.name}`);
        }
        // Logic for drawing a card would go here
        console.log("Drew 1 card");
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

    IsPerformableOn = (targetCard: AbstractCard): boolean => {
        return targetCard instanceof AutomatedCharacter;
    }

    InvokeCardEffects = (targetCard?: AbstractCard): void => {
        if (targetCard && targetCard instanceof BaseCharacter) {
            ActionManager.getInstance().dealDamage({ target: targetCard, amount: 6 });
            console.log(`Dealt 6 damage to ${targetCard.name}`);
        }
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

    InvokeCardEffects = (targetCard?: AbstractCard): void => {
        if (targetCard && targetCard instanceof BaseCharacter) {
            //ActionManager.getInstance().applyPoison({ target: targetCard, amount: 3 });
            console.log(`Applied 3 Poison to ${targetCard.name}`);
        }
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

    InvokeCardEffects = (targetCard?: AbstractCard): void => {
        if (targetCard && targetCard instanceof BaseCharacter) {
            //ActionManager.getInstance().summonDemon({ target: targetCard, amount: 5 });
            console.log(`Summoned a 5/5 Demon minion`);
        }
    }
}