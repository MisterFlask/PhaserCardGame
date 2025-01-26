// On pickup, add a Soul Vacuum to your master deck owned by a random character.  It costs 1 to play, deals 10 damage to ALL enemies, exhausts, and has Lightweight 4.  Whenever it kills an enemy, it gains +10 surface sell value.

import { TargetingType } from "../../gamecharacters/AbstractCard";
import { BaseCharacter } from "../../gamecharacters/BaseCharacter";
import { EntityRarity, PlayableCard } from "../../gamecharacters/PlayableCard";
import { CardType } from "../../gamecharacters/Primitives";
import { AbstractBuff } from "../../gamecharacters/buffs/AbstractBuff";
import { ExhaustBuff } from "../../gamecharacters/buffs/playable_card/ExhaustBuff";
import { Lightweight } from "../../gamecharacters/buffs/playable_card/Lightweight";
import { GameState } from "../../rules/GameState";
import { AbstractRelic } from "../AbstractRelic";

class SoulVacuumValueBuff extends AbstractBuff {
    constructor() {
        super();
        this.moveToMainDescription = true;
    }

    override getDisplayName(): string {
        return "Soul Vacuum Value";
    }

    override getDescription(): string {
        return "When this card kills an enemy, gain +10 surface sell value.";
    }

    override onFatal(killedUnit: BaseCharacter): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (!ownerCard) return;

        ownerCard.mirrorChangeToCanonicalCard((canonicalCard) => {
            canonicalCard.surfacePurchaseValue += 10;
        });
    }
}

export class SoulVacuum extends PlayableCard {
    constructor() {
        super({
            name: "Soul Vacuum",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.baseDamage = 10;
        this.buffs.push(new ExhaustBuff());
        this.buffs.push(new Lightweight(4));
        this.buffs.push(new SoulVacuumValueBuff());
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage to ALL enemies. Exhaust. When this card kills an enemy, gain +10 surface sell value.`;
    }

    override InvokeCardEffects(): void {
        this.forEachEnemy((enemy) => {
            this.dealDamageToTarget(enemy);
        });
    }
}

export class SoulBottler extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.UNCOMMON;
    }

    override getDisplayName(): string {
        return "Soul Bottler";
    }

    override getDescription(): string {
        return "On pickup, add a Soul Vacuum to your master deck owned by a random character. It costs 1 to play, deals 10 damage to ALL enemies, exhausts, and has Lightweight 4. Whenever it kills an enemy, it gains +10 surface sell value.";
    }

    override onGainingThisCard(): void {
        const gameState = GameState.getInstance();
        const livingAllies = gameState.combatState.playerCharacters.filter(char => !char.isDead());
        
        if (livingAllies.length > 0) {
            const randomAlly = livingAllies[Math.floor(Math.random() * livingAllies.length)];
            const soulVacuum = new SoulVacuum();
            soulVacuum.owningCharacter = randomAlly;
            randomAlly.cardsInMasterDeck.push(soulVacuum);
        }
    }
}

