// Promotion application: the "commit" step of a soldier levelling up. Split
// out from Leveling.ts (which must stay Phaser-free per house rule 1)
// because this touches PlayableCard/PlayerCharacter, which transitively pull
// in Phaser via AbstractCard.
//
// This is the API the later promotion-UI agent calls: it does the actual
// level increment, deck insertion, and perk roll. Card selection (which 3
// cards to offer) lives in CardRewardsGenerator.generateCardRewardsForLevelUp;
// this function only applies a choice once made.

import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { grantRandomPerk } from "../gamecharacters/buffs/perks/PerkPools";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { PlayerCharacter } from "../gamecharacters/PlayerCharacter";
import { levelGrantsPerk } from "./Leveling";

export interface PromotionResult {
    newLevel: number;
    perkGranted: AbstractBuff | null;
}

/**
 * Applies one pending promotion: increments the character's level, adds the
 * chosen card to their persistent deck, and — if the new level is a perk
 * level (4 or 8) — rolls a random class perk via grantRandomPerk.
 *
 * The card pick is mandatory by design (every level 2-10 offers a choice);
 * `chosenCard` is nullable only as a defensive escape hatch (e.g. the UI
 * somehow has nothing to offer), in which case a warning is logged and the
 * level still advances (a soldier is not blocked from promotion because the
 * reward screen glitched).
 */
export function applyPromotion(
    character: PlayerCharacter,
    chosenCard: PlayableCard | null,
    rng?: () => number
): PromotionResult {
    const newLevel = character.level + 1;
    character.level = newLevel;

    if (chosenCard) {
        character.addCard(chosenCard);
    } else {
        console.warn(
            `applyPromotion: ${character.name} promoted to level ${newLevel} with no card chosen. ` +
            `Card pick is mandatory per design (strategic_layer_redesign.md); this should not happen ` +
            `outside a defensive/test path.`
        );
    }

    let perkGranted: AbstractBuff | null = null;
    if (levelGrantsPerk(newLevel)) {
        perkGranted = grantRandomPerk(character, rng);
    }

    return { newLevel, perkGranted };
}
