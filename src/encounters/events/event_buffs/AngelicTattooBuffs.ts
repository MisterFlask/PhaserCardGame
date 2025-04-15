import { IBaseCharacter } from "../../../gamecharacters/IBaseCharacter";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { CardType } from "../../../gamecharacters/Primitives";
import { AbstractBuff } from "../../../gamecharacters/buffs/AbstractBuff";
import { Dexterity } from "../../../gamecharacters/buffs/persona/Dexterity";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";
import { Weak } from "../../../gamecharacters/buffs/standard/Weak";
import { DamageInfo } from "../../../rules/DamageInfo";

/**
 * Angelic Tattoo Buffs - Permanent character buffs granted by the Angelic Tattoo Event
 */

// Eye of Seraphiel - Draw and discard cards at combat start
export class EyeOfSeraphiel extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "eye_icon"; // Replace with actual asset name
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "I CAN SEE FOREVER";
    }

    getDisplayName(): string {
        return "Eye of Seraphiel";
    }

    getDescription(): string {
        return "At combat start, draw 3 cards and discard 4 cards.";
    }

    onCombatStart(): void {
        this.actionManager.drawCards(3);
        // For discard, we'll use chooseCardToDiscard which is a valid method
        this.actionManager.chooseCardToDiscard(Math.min(4, this.combatState.currentHand.length));
        this.pulseBuff();
    }
}

// Stigmata of the Martyr - Gain strength when drawing a Curse
export class StigmataOfTheMartyr extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "stigmata_icon"; // Replace with actual asset name
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "Bleeding forever is a small price.";
    }

    getDisplayName(): string {
        return "Stigmata of Mercy";
    }

    getDescription(): string {
        return "Whenever you draw a Curse, gain 1 Strength.";
    }

    // Handle the card drawn through onAnyCardDrawn which is a valid method
    onAnyCardDrawn(card: PlayableCard): void {
        // Check for "curse" in the name or if it's a status card which often represents curse cards
        if (card.cardType === CardType.STATUS || card.name.toLowerCase().includes("curse")) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                this.actionManager.applyBuffToCharacter(owner, new Lethality(1));
                this.pulseBuff();
            }
        }
    }
}

// Mark of Zadkiel - Apply Weak to all enemies at combat start
export class MarkOfZadkiel extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "zadkiel_icon"; // Replace with actual asset name
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "The mark of mercy weakens the resolve of your enemies.";
    }

    getDisplayName(): string {
        return "Mark of Zadkiel";
    }

    getDescription(): string {
        return "At combat start, apply 2 Weak to all enemies.";
    }

    onCombatStart(): void {
        // Using the enemies array directly, which we know exists
        const enemies = this.gameState.combatState.enemies;
        for (const enemy of enemies) {
            this.actionManager.applyBuffToCharacter(enemy, new Weak(2));
        }
        this.pulseBuff();
    }
}

// Flames of Uriel - First attack each combat deals triple damage
export class FlamesOfUriel extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "flames_icon"; // Replace with actual asset name
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "The fire doesn't burn him, but it scorches everything else.";
        this.secondaryStacks = 0; // 0 means the buff is active, 1 means it's been used
    }

    getDisplayName(): string {
        return "Flames of Uriel";
    }

    getDescription(): string {
        return "Your first Attack each combat deals triple damage.";
    }

    onCombatStart(): void {
        this.secondaryStacks = 0; // Reset the usage tracker
    }

    getAdditionalPercentCombatDamageDealtModifier(): number {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard && ownerCard.cardType === CardType.ATTACK && this.secondaryStacks === 0) {
            this.secondaryStacks = 1; // Mark as used
            this.pulseBuff();
            return 2.0; // Triple damage (base + 200%)
        }
        return 0;
    }
}

// Voice of Metatron - Every 3rd skill played costs 0 energy
export class VoiceOfMetatron extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "voice_icon"; // Replace with actual asset name
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "His commands now carry an unsettling echo of divine authority.";
        this.secondaryStacks = 0; // Counter for skills played
    }

    getDisplayName(): string {
        return "Voice of Metatron";
    }

    getDescription(): string {
        return "Every 3rd Skill played costs 0 energy.";
    }

    onCombatStart(): void {
        this.secondaryStacks = 0;
    }

    onCardPlayed(card: PlayableCard): void {
        if (card.cardType === CardType.SKILL) {
            this.secondaryStacks++;
            if (this.secondaryStacks >= 3) {
                this.secondaryStacks = 0;
                this.pulseBuff();
            }
        }
    }

    getCardPlayEnergyModifier(card: PlayableCard): number {
        if (card.cardType === CardType.SKILL && this.secondaryStacks === 2) {
            // The third skill (count = 2 before incrementing in onCardPlayed)
            return -card.energyCost; // Reduce cost to 0
        }
        return 0;
    }
}

// Sigil of Azrael - Prevent fatal damage once per combat
export class SigilOfAzrael extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "azrael_icon"; // Replace with actual asset name
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "Death isn't the end. It's a polite suggestion.";
        this.secondaryStacks = 0; // 0 means unused, 1 means used
    }

    getDisplayName(): string {
        return "Sigil of Azrael";
    }

    getDescription(): string {
        return "Once per combat, prevent fatal damage and remain at 1 HP.";
    }

    onCombatStart() {
        this.secondaryStacks = 0; // Reset usage tracker
    }

    onOwnerStruck_CannotModifyDamage(strikingUnit: IBaseCharacter | null, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo) {
        const owner = this.getOwnerAsCharacter();
        if (!owner) return;

        if (this.secondaryStacks === 0 && owner.hitpoints <= damageInfo.damageDealt) {
            // This damage would be fatal
            damageInfo.damageDealt = owner.hitpoints - 1; // Reduce damage to leave 1 HP
            this.secondaryStacks = 1; // Mark as used
            this.pulseBuff();
        }
    }
}

// Raphael's Grace - Healing at end of combat
export class RaphaelsGrace extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "grace_icon"; // Replace with actual asset name
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "The wounds close before they're fully opened.";
    }

    getDisplayName(): string {
        return "Raphael's Grace";
    }

    getDescription(): string {
        return "Heal 2 HP at the end of each combat.";
    }

    onCombatEnd() {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.heal(owner, 2);
            this.pulseBuff();
        }
    }
}

// Michael's Ire - Strength bonus
export class MichaelsIre extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "ire_icon"; // Replace with actual asset name
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "The wrath of heaven makes men into weapons.";
    }

    getDisplayName(): string {
        return "Michael's Ire";
    }

    getDescription(): string {
        return "Start each combat with +2 Strength.";
    }

    onCombatStart() {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacter(owner, new Lethality(2));
            this.pulseBuff();
        }
    }
}

// Seal of Sandalphon - Gain Dexterity on shuffle
export class SealOfSandalphon extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "seal_icon"; // Replace with actual asset name
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "Earth listens closely, trembling beneath his step.";
    }

    getDisplayName(): string {
        return "Seal of Sandalphon";
    }

    getDescription(): string {
        return "Gain 1 Dexterity each time you shuffle your draw pile.";
    }

    // This assumes there's a hook for shuffle events
    onDrawPileShuffled(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacter(owner, new Dexterity(1));
            this.pulseBuff();
        }
    }
}

// Halo of Gabriel - Energy bonus
export class HaloOfGabriel extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "halo_icon"; // Replace with actual asset name
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "The faint glow is reassuring, until it blinds you.";
    }

    getDisplayName(): string {
        return "Halo of Gabriel";
    }

    getDescription(): string {
        return "Start each combat with " + this.stacks + " additional Energy.";
    }

    onCombatStart() {
        this.actionManager.modifyEnergy(this.stacks);
        this.pulseBuff();
    }
}

// Helper to get a random tattoo buff
export function getRandomAngelicTattooBuff(stacks: number = 1): AbstractBuff {
    const tattooBuffs = [
        new EyeOfSeraphiel(stacks),
        new StigmataOfTheMartyr(stacks),
        new MarkOfZadkiel(stacks),
        new FlamesOfUriel(stacks),
        new VoiceOfMetatron(stacks),
        new SigilOfAzrael(stacks),
        new RaphaelsGrace(stacks),
        new MichaelsIre(stacks),
        new SealOfSandalphon(stacks),
        new HaloOfGabriel(stacks)
    ];
    
    const randomIndex = Math.floor(Math.random() * tattooBuffs.length);
    return tattooBuffs[randomIndex];
}

// Helper to get all available tattoo buffs
export function getAllAngelicTattooBuffs(stacks: number = 1): AbstractBuff[] {
    return [
        new EyeOfSeraphiel(stacks),
        new StigmataOfTheMartyr(stacks),
        new MarkOfZadkiel(stacks),
        new FlamesOfUriel(stacks),
        new VoiceOfMetatron(stacks),
        new SigilOfAzrael(stacks),
        new RaphaelsGrace(stacks),
        new MichaelsIre(stacks),
        new SealOfSandalphon(stacks),
        new HaloOfGabriel(stacks)
    ];
}