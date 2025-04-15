/**
 * brimstone lung
"like breathing hot coals. you'll wish you'd stayed topside."
effect: at combat start, gain 1 less energy on turn 1.

imp's itch
"scratching doesn't help, but neither does screaming."
effect: whenever you play 3 attacks in a single turn, take 2 damage.

wormrot
"they hatch slow. pray you die faster."
effect: each rest site heals 15% less HP.

ashen shakes
"hands tremble, aim fails, hell smiles."
effect: whenever you draw a curse or status, become vulnerable for 1 turn.

bloodboil fever
"your veins run hotter than hellfire—but strength melts away."
effect: at combat start, lose 2 strength until turn 3.

sinner's mark
"demons always find their favorite prey."
effect: enemies prioritize attacking this character when possible.

hellmouth sores
"every word tastes bitter, every shout brings agony."
effect: skills cost +1 energy on your first turn each combat.

the pit sweats
"armor slips, blades drop, and dignity evaporates."
effect: lose 1 dexterity whenever you take unblocked attack damage (resets after combat).
 */

import { BaseCharacter } from "../../../gamecharacters/BaseCharacter";
import { AbstractBuff } from "../../../gamecharacters/buffs/AbstractBuff";
import { Dexterity } from "../../../gamecharacters/buffs/persona/Dexterity";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";
import { Vulnerable } from "../../../gamecharacters/buffs/standard/Vulnerable";
import { IBaseCharacter } from "../../../gamecharacters/IBaseCharacter";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { CardType } from "../../../gamecharacters/Primitives";
import { DamageInfo } from "../../../rules/DamageInfo";

// Brimstone Lung - Less energy on turn 1
export class BrimstoneLung extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "brimstone_lung_icon"; // Replace with actual asset name
        this.isDebuff = true;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "Like breathing hot coals. You'll wish you'd stayed topside.";
    }

    getDisplayName(): string {
        return "Brimstone Lung";
    }

    getDescription(): string {
        return "At combat start, gain 1 less energy on turn 1.";
    }

    onCombatStart(): void {
        this.actionManager.modifyEnergy(-1);
        this.pulseBuff();
    }
}

// Imp's Itch - Take damage when playing 3 attacks in a turn
export class ImpsItch extends AbstractBuff {
    private attacksPlayedThisTurn: number = 0;

    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "imps_itch_icon"; // Replace with actual asset name
        this.isDebuff = true;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "Scratching doesn't help, but neither does screaming.";
    }

    getDisplayName(): string {
        return "Imp's Itch";
    }

    getDescription(): string {
        return "Whenever you play 3 attacks in a single turn, take 2 damage.";
    }

    onTurnStart(): void {
        this.attacksPlayedThisTurn = 0;
    }

    onAnyCardPlayedByAnyone(playedCard: PlayableCard, target?: BaseCharacter): void {
        const owner = this.getOwnerAsCharacter();
        if (!owner) return;

        // Only count attacks played by the owner
        if (playedCard.cardType === CardType.ATTACK && playedCard.owningCharacter === owner) {
            this.attacksPlayedThisTurn++;
            if (this.attacksPlayedThisTurn >= 3) {
                this.actionManager.dealDamage({ baseDamageAmount: 2, target: owner, fromAttack: false });
                this.pulseBuff();
                this.attacksPlayedThisTurn = 0; // Reset counter
            }
        }
    }
}

// Wormrot - Reduces healing from rest sites
export class Wormrot extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "wormrot_icon"; // Replace with actual asset name
        this.isDebuff = true;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "They hatch slow. Pray you die faster.";
    }

    getDisplayName(): string {
        return "Wormrot";
    }

    getDescription(): string {
        return "Each rest site heals 15% less HP.";
    }

    // This would need to hook into the rest site healing mechanism
    // Assuming there's a method that gets called when resting at a site
    onRest(card: PlayableCard): void {
        // This method would need to integrate with how healing is calculated at rest sites
        // For now, we'll assume this is handled elsewhere in the codebase
        this.pulseBuff();
    }
}

// Ashen Shakes - Become vulnerable when drawing a curse/status
export class AshenShakes extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "ashen_shakes_icon"; // Replace with actual asset name
        this.isDebuff = true;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "Hands tremble, aim fails, hell smiles.";
    }

    getDisplayName(): string {
        return "Ashen Shakes";
    }

    getDescription(): string {
        return "Whenever you draw a curse or status, become vulnerable for 1 turn.";
    }

    onAnyCardDrawn(card: PlayableCard): void {
        if (card.cardType === CardType.STATUS || card.name.toLowerCase().includes("curse")) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                this.actionManager.applyBuffToCharacter(owner, new Vulnerable(1));
                this.pulseBuff();
            }
        }
    }
}

// Bloodboil Fever - Lose strength at combat start
export class BloodboilFever extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "bloodboil_fever_icon"; // Replace with actual asset name
        this.isDebuff = true;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "Your veins run hotter than hellfire—but strength melts away.";
    }

    getDisplayName(): string {
        return "Bloodboil Fever";
    }

    getDescription(): string {
        return "At combat start, lose 2 strength until turn 3.";
    }

    onCombatStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacter(owner, new Lethality(-2));
            this.secondaryStacks = 0; // Counter for turns
            this.pulseBuff();
        }
    }

    onTurnStart(): void {
        this.secondaryStacks++;
        if (this.secondaryStacks === 3) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                this.actionManager.applyBuffToCharacter(owner, new Lethality(2));
                this.pulseBuff();
            }
        }
    }
}

// Hellmouth Sores - Skills cost more energy on first turn
export class HellmouthSores extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "hellmouth_sores_icon"; // Replace with actual asset name
        this.isDebuff = true;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "Every word tastes bitter, every shout brings agony.";
        this.secondaryStacks = 0; // 0 for first turn, 1 for subsequent turns
    }

    getDisplayName(): string {
        return "Hellmouth Sores";
    }

    getDescription(): string {
        return "Skills cost +1 energy on your first turn each combat.";
    }

    onCombatStart(): void {
        this.secondaryStacks = 0;
    }

    onTurnStart(): void {
        if (this.secondaryStacks === 0) {
            this.secondaryStacks = 1;
        }
    }

    energyCostModifier(): number {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard && ownerCard.cardType === CardType.SKILL && this.secondaryStacks === 0) {
            return 1; // Increase cost on first turn
        }
        return 0;
    }
}

// The Pit Sweats - Lose dexterity on unblocked damage
export class ThePitSweats extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.imageName = "pit_sweats_icon"; // Replace with actual asset name
        this.isDebuff = true;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
        this.flavorText = "Armor slips, blades drop, and dignity evaporates.";
    }

    getDisplayName(): string {
        return "The Pit Sweats";
    }

    getDescription(): string {
        return "Lose 1 dexterity whenever you take unblocked attack damage (resets after combat).";
    }

    onOwnerStruck_CannotModifyDamage(strikingUnit: IBaseCharacter | null, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void {
        const owner = this.getOwnerAsCharacter();
        if (!owner) return;

        // Only apply if damage was not fully blocked
        if (damageInfo.damageDealt > 0) {
            this.actionManager.applyBuffToCharacter(owner, new Dexterity(-1));
            this.pulseBuff();
        }
    }

    onCombatEnd(): void {
        // Reset will happen by removing the Dexterity debuff after combat
    }
}

// Helper to get a random hell disease
export function getRandomHellDisease(stacks: number = 1): AbstractBuff {
    const diseases = [
        new BrimstoneLung(stacks),
        new ImpsItch(stacks),
        new Wormrot(stacks),
        new AshenShakes(stacks),
        new BloodboilFever(stacks),
        new HellmouthSores(stacks),
        new ThePitSweats(stacks)
    ];
    
    const randomIndex = Math.floor(Math.random() * diseases.length);
    return diseases[randomIndex];
}

// Helper to get all available hell diseases
export function getAllHellDiseases(stacks: number = 1): AbstractBuff[] {
    return [
        new BrimstoneLung(stacks),
        new ImpsItch(stacks),
        new Wormrot(stacks),
        new AshenShakes(stacks),
        new BloodboilFever(stacks),
        new HellmouthSores(stacks),
        new ThePitSweats(stacks)
    ];
}