// v2 IPlayPolicy: a materially smarter baseline than randomLegalPolicy, used
// to measure a plausible LOWER BOUND on human win rates (see
// scripts/measure-combat-rates.mjs). Priority order per choosePlay() call:
//
//   1. Lethal: if any affordable, legally-targetable attack this turn can
//      kill an enemy outright (its computed damage >= that enemy's current
//      hitpoints), play the cheapest such card on the enemy it can kill
//      (preferring the lowest-HP killable target so overkill is minimized).
//   2. Block: if this character's *total* incoming attack-intent damage this
//      turn (summed across all intents targeting it/all-players, computed
//      via AttackIntent.displayedDamage() where available) exceeds its
//      current block, play the highest-block affordable block card.
//   3. Damage: otherwise play the highest-damage affordable attack, targeted
//      at the lowest-HP living enemy (focus-fire).
//   4. Utility: otherwise play the cheapest remaining affordable card (any
//      targeting type) to spend leftover energy productively.
//   5. End turn once nothing affordable/legal remains.
//
// This is intentionally simple and legible -- a baseline for measuring
// policy-quality sensitivity in the campaign economy, not an AI project. See
// RandomLegalPolicy.ts for the v1 policy and IPlayPolicy.ts for the seam
// this implements.

import { GameState } from '../../rules/GameState';
import { CombatRules } from '../../rules/CombatRulesHelper';
import { TargetingType } from '../../gamecharacters/AbstractCard';
import { CardType } from '../../gamecharacters/Primitives';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { BaseCharacterType } from '../../Types';
import { AttackIntent } from '../../gamecharacters/AbstractIntent';
import { IPlayPolicy, PlayChoice } from './IPlayPolicy';

function legalTargetsFor(card: PlayableCard): BaseCharacterType[] {
    const combatState = GameState.getInstance().combatState;
    switch (card.targetingType) {
        case TargetingType.NO_TARGETING:
            return [];
        case TargetingType.ALLY:
            return combatState.playerCharacters.filter(c => c.hitpoints > 0);
        case TargetingType.ENEMY:
        default:
            return combatState.enemies.filter(c => c.hitpoints > 0);
    }
}

function affordablePlayable(): PlayableCard[] {
    const combatState = GameState.getInstance().combatState;
    return combatState.currentHand.filter(card => {
        if (card.energyCost > combatState.energyAvailable) return false;
        if (card.targetingType === TargetingType.NO_TARGETING) {
            return card.IsPerformableOn(undefined);
        }
        const targets = legalTargetsFor(card);
        return targets.length > 0 && targets.some(t => card.IsPerformableOn(t));
    });
}

/** Damage this card would deal to a specific target, post-modifiers, via the
 *  real damage-calc pipeline (mirrors AttackIntent.displayedDamage()'s use
 *  of CombatRules.calculateDamage, just from the player-card side). Cards
 *  with baseDamage 0 (skills/blocks/etc.) return 0 -- they're not attacks. */
function computeCardDamageOn(card: PlayableCard, target: BaseCharacterType): number {
    const scaledDamage = card.getBaseDamageAfterResourceScaling();
    if (scaledDamage <= 0) return 0;
    return CombatRules.calculateDamage({
        baseDamageAmount: scaledDamage,
        target,
        sourceCharacter: card.owningCharacter,
        sourceCard: card,
        fromAttack: true
    }).totalDamage;
}

/** Sum of this turn's incoming attack-intent damage aimed at `character`
 *  (own targeted intents plus all-player intents), using each intent's
 *  post-modifier displayedDamage() where the intent exposes one
 *  (AttackIntent/AttackAllPlayerCharactersIntent both do via their own
 *  displayedDamage()); non-damage intents (buffs, summons, etc.) contribute
 *  0 since they carry no relevant number here. */
function incomingDamageThisTurn(character: BaseCharacterType): number {
    // getIntentsTargetingThisCharacter() also walks non-enemy "incoming
    // intent" sources (card buffs like Hazardous -- see
    // CombatRules.retrieveIncomingNonEnemyIntentInformationForCharacter),
    // which is pre-existing rules code this policy doesn't own. A known
    // latent bug there (Hazardous.incomingAttackIntentValue force-unwraps a
    // possibly-null card owner) can throw for hand contents unrelated to
    // this policy's own choices; swallow and treat as "no extra incoming
    // damage known" rather than let a baseline AI crash the combat over a
    // pre-existing rules-layer edge case. Reported separately as a combat
    // bug finding -- not fixed here (out of this file's ownership).
    let intents: ReturnType<BaseCharacterType['getIntentsTargetingThisCharacter']>;
    try {
        intents = character.getIntentsTargetingThisCharacter();
    } catch {
        return 0;
    }
    let total = 0;
    for (const intent of intents) {
        const anyIntent = intent as any;
        try {
            if (typeof anyIntent.displayedDamage === 'function') {
                total += anyIntent.displayedDamage();
            } else if (intent instanceof AttackIntent) {
                total += intent.baseDamage;
            }
        } catch {
            // Same defensive rationale as above -- a single bad intent's
            // damage calc must not abort the whole block decision.
        }
    }
    return total;
}

export function greedyPolicy(): IPlayPolicy {
    return {
        choosePlay(): PlayChoice {
            const combatState = GameState.getInstance().combatState;
            const playable = affordablePlayable();
            if (playable.length === 0) {
                return { kind: 'endTurn' };
            }

            // 1. Lethal: cheapest attack that can kill some enemy outright,
            // targeted at the killable enemy with the lowest HP (least overkill).
            let bestLethal: { card: PlayableCard; target: BaseCharacterType } | null = null;
            for (const card of playable) {
                if (card.targetingType !== TargetingType.ENEMY) continue;
                const targets = legalTargetsFor(card).filter(t => card.IsPerformableOn(t));
                for (const target of targets) {
                    const dmg = computeCardDamageOn(card, target);
                    if (dmg <= 0 || dmg < target.hitpoints) continue;
                    const better = !bestLethal
                        || card.energyCost < bestLethal.card.energyCost
                        || (card.energyCost === bestLethal.card.energyCost && target.hitpoints < bestLethal.target.hitpoints);
                    if (better) bestLethal = { card, target };
                }
            }
            if (bestLethal) {
                return { kind: 'play', card: bestLethal.card, target: bestLethal.target };
            }

            // 2. Block: if any living player character's incoming intent
            // damage this turn exceeds their current block, play the
            // highest-block affordable block card on that character (or the
            // most-threatened character if the card is self/no-target only).
            const blockCards = playable.filter(c => c.getBaseBlockAfterResourceScaling() > 0);
            if (blockCards.length > 0) {
                const threatened = combatState.playerCharacters
                    .filter(p => p.hitpoints > 0)
                    .map(p => ({ p, deficit: incomingDamageThisTurn(p) - p.block }))
                    .filter(x => x.deficit > 0)
                    .sort((a, b) => b.deficit - a.deficit);
                if (threatened.length > 0) {
                    const mostThreatened = threatened[0].p;
                    const candidates = blockCards.filter(c => {
                        if (c.targetingType === TargetingType.NO_TARGETING) return true;
                        return legalTargetsFor(c).filter(t => c.IsPerformableOn(t)).some(t => t === mostThreatened);
                    });
                    if (candidates.length > 0) {
                        const bestBlock = candidates.reduce((a, b) =>
                            b.getBaseBlockAfterResourceScaling() > a.getBaseBlockAfterResourceScaling() ? b : a);
                        if (bestBlock.targetingType === TargetingType.NO_TARGETING) {
                            return { kind: 'play', card: bestBlock };
                        }
                        return { kind: 'play', card: bestBlock, target: mostThreatened };
                    }
                }
            }

            // 3. Damage: highest-damage affordable attack, at the lowest-HP
            // living enemy it can legally hit (focus-fire).
            const livingEnemies = combatState.enemies.filter(e => e.hitpoints > 0);
            if (livingEnemies.length > 0) {
                let bestAttack: { card: PlayableCard; target: BaseCharacterType; dmg: number } | null = null;
                for (const card of playable) {
                    if (card.targetingType !== TargetingType.ENEMY) continue;
                    if (card.cardType !== CardType.ATTACK && card.getBaseDamageAfterResourceScaling() <= 0) continue;
                    const targets = legalTargetsFor(card).filter(t => card.IsPerformableOn(t));
                    for (const target of targets) {
                        const dmg = computeCardDamageOn(card, target);
                        if (dmg <= 0) continue;
                        const better = !bestAttack
                            || dmg > bestAttack.dmg
                            || (dmg === bestAttack.dmg && target.hitpoints < bestAttack.target.hitpoints);
                        if (better) bestAttack = { card, target, dmg };
                    }
                }
                if (bestAttack) {
                    // Focus the single lowest-HP living enemy this attack can
                    // legally hit, rather than whichever target happened to
                    // score highest damage above (ties across targets).
                    const cardTargets = legalTargetsFor(bestAttack.card).filter(t => bestAttack!.card.IsPerformableOn(t));
                    const focusTarget = cardTargets.reduce((a, b) => (b.hitpoints < a.hitpoints ? b : a));
                    return { kind: 'play', card: bestAttack.card, target: focusTarget };
                }
            }

            // 4. Utility: cheapest remaining affordable card, any targeting.
            const cheapest = playable.reduce((a, b) => (b.energyCost < a.energyCost ? b : a));
            if (cheapest.targetingType === TargetingType.NO_TARGETING) {
                return { kind: 'play', card: cheapest };
            }
            const targets = legalTargetsFor(cheapest).filter(t => cheapest.IsPerformableOn(t));
            if (targets.length === 0) {
                return { kind: 'endTurn' };
            }
            return { kind: 'play', card: cheapest, target: targets[0] };
        },

        // "Choose N cards from hand" prompts (discard, exhaust-select, etc.):
        // keep attacks, hand back non-attacks first when a prompt wants cards
        // *removed* from hand-adjacent piles. Callers only ever ask this
        // policy to pick `count` cards between min and max; we pick the
        // fewest (min) and prefer non-attack cards so attacks stay in play.
        chooseCardsFromHand({ min, max, candidates }): PlayableCard[] {
            const count = Math.min(candidates.length, min);
            const sorted = [...candidates].sort((a, b) => {
                const aAttack = a.cardType === CardType.ATTACK ? 1 : 0;
                const bAttack = b.cardType === CardType.ATTACK ? 1 : 0;
                return aAttack - bAttack; // non-attacks first
            });
            return sorted.slice(0, Math.max(count, min === max ? min : count));
        },

        // "Choose from a custom pool" prompts (rewards/discoveries): prefer
        // attack cards among the offered pool (keeps the squad's damage
        // output up), taking up to `max`.
        chooseCardsFromPool({ min, max, cardPool }): PlayableCard[] {
            const sorted = [...cardPool].sort((a, b) => {
                const aAttack = a.cardType === CardType.ATTACK ? 1 : 0;
                const bAttack = b.cardType === CardType.ATTACK ? 1 : 0;
                return bAttack - aAttack; // attacks first
            });
            const count = Math.max(min, Math.min(max, sorted.length));
            return sorted.slice(0, count);
        }
    };
}
