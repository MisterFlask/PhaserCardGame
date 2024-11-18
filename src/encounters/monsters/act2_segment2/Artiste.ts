import { AbstractCard, TargetingType } from "../../../gamecharacters/AbstractCard";
import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { BaseCharacter } from "../../../gamecharacters/BaseCharacter";
import { Muse } from "../../../gamecharacters/buffs/enemy_buffs/Muse";
import { Painful } from "../../../gamecharacters/buffs/playable_card/Painful";
import { Strong } from "../../../gamecharacters/buffs/standard/Strong";
import { EntityRarity, PlayableCard } from "../../../gamecharacters/PlayableCard";
import { CardType } from "../../../gamecharacters/Primitives";


export class Artiste extends AutomatedCharacter {
    constructor() {
        super({
            name: "L'Artiste Moderne",
            portraitName: "Eldritch Artiste",
            maxHitpoints: 120,
            description: "creates art that hurts to look at"
        });

        this.buffs.push(new Muse(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new ApplyDebuffToAllPlayerCharactersIntent({ 
                    debuff: new Painful(1), 
                    owner: this 
                }).withTitle("Avant-Garde Vision")
            ],
            [
                new AttackIntent({ 
                    baseDamage: 36, 
                    owner: this,
                }).withTitle("Penetration")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}

class ModernArtAttack extends PlayableCard {
    constructor() {
        super({
            name: "What The Hell Is This",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseDamage = 5;
        this.buffs.push(new Painful(1));
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        this.dealDamageToTarget(targetCard as BaseCharacter);
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Painful(1).`;
    }
}

class ModernArtDefend extends PlayableCard {
    constructor() {
        super({
            name: "What Am I Even Looking At",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseBlock = 4;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        this.actionManager.applyBlock({ baseBlockValue: this.getBaseBlockAfterResourceScaling() });
    }

    override get description(): string {
        return `Gain ${this.getDisplayedBlock()} Block. Painful(1).`;
    }

    override OnPurchase(): void {
        this.buffs.push(new Painful(1));
    }
}

class ModernArtStrength extends PlayableCard {
    constructor() {
        super({
            name: "Afpoiasdoif",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseMagicNumber = 1;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        this.combatState.playerCharacters.forEach(ally => {
            this.actionManager.applyBuffToCharacterOrCard(ally, new Strong(this.getBaseMagicNumberAfterResourceScaling()) );
        });
    }

    override get description(): string {
        return `All allies gain ${this.getDisplayedMagicNumber()} Strength. Painful(1).`;
    }

    override OnPurchase(): void {
        this.buffs.push(new Painful(1));
    }
}

