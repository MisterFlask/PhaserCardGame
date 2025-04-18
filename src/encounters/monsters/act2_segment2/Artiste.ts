import { AbstractCard, TargetingType } from "../../../gamecharacters/AbstractCard";
import { AbstractIntent, AddCardToPileIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { BaseCharacter } from "../../../gamecharacters/BaseCharacter";
import { Muse } from "../../../gamecharacters/buffs/enemy_buffs/Muse";
import { Painful } from "../../../gamecharacters/buffs/playable_card/Painful";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";
import { EntityRarity } from "../../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { CardType } from "../../../gamecharacters/Primitives";



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
            this.actionManager.applyBuffToCharacterOrCard(ally, new Lethality(this.getBaseMagicNumberAfterResourceScaling()) );
        });
    }

    override get description(): string {
        return `All allies gain ${this.getDisplayedMagicNumber()} Strength. Painful(1).`;
    }

    override OnPurchase(): void {
        this.buffs.push(new Painful(1));
    }
}

export class Artiste extends AutomatedCharacter {
    constructor() {
        super({
            name: "L'Artiste Moderne",
            portraitName: "Eldritch Slime Spawn A",
            maxHitpoints: 120,
            description: "creates art that hurts to look at"
        });

        this.buffs.push(new Muse(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AddCardToPileIntent({
                    cardToAdd: new ModernArtAttack(),
                    pileName: 'draw',
                    owner: this
                }).withTitle("Incomprehensible Scribbles"),
                new AddCardToPileIntent({
                    cardToAdd: new ModernArtDefend(),
                    pileName: 'draw',
                    owner: this
                }).withTitle("Incomprehensible Scribbles"),
                new AddCardToPileIntent({
                    cardToAdd: new ModernArtStrength(),
                    pileName: 'draw',
                    owner: this
                }).withTitle("Incomprehensible Scribbles")
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
