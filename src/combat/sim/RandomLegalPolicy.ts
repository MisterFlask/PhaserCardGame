// v1 IPlayPolicy: plays random affordable cards at random legal targets
// until it can't afford anything else, then ends turn. No strategy -- this
// exists to exercise the rules pipeline (win-rate/turn-count distributions,
// queue-error detection), not to play well. A smarter policy is a natural
// v2 once the harness itself is proven out.

import { GameState } from '../../rules/GameState';
import { TargetingType } from '../../gamecharacters/AbstractCard';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { BaseCharacterType } from '../../Types';
import { IPlayPolicy, PlayChoice } from './IPlayPolicy';

/** Minimal seeded RNG (mulberry32) so a policy run can be made reproducible
 *  independent of Math.random(). NOTE: this only seeds the policy's own
 *  choices (which card, which target, which discard) -- rules code
 *  downstream (deck shuffling in StartCombatAction, TargetingUtils'
 *  enemy-intent target selection, ActionManager.exhaustRandomCardInHand,
 *  etc.) calls Math.random() directly and is not routed through this
 *  source. A given seed will NOT reproduce an identical combat end to end;
 *  it only makes the policy layer's decisions reproducible given identical
 *  upstream rng draws. Full determinism would require threading an RNG
 *  through those call sites too, which is outside this policy file's
 *  ownership. */
export function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pickRandom<T>(items: readonly T[], rng: () => number): T | undefined {
    if (items.length === 0) return undefined;
    return items[Math.floor(rng() * items.length)];
}

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

export function randomLegalPolicy(rng: () => number = Math.random): IPlayPolicy {
    return {
        choosePlay(): PlayChoice {
            const combatState = GameState.getInstance().combatState;
            const hand = combatState.currentHand;

            const playable = hand.filter(card => {
                if (card.energyCost > combatState.energyAvailable) {
                    return false;
                }
                if (card.targetingType === TargetingType.NO_TARGETING) {
                    return card.IsPerformableOn(undefined);
                }
                const targets = legalTargetsFor(card);
                return targets.length > 0 && targets.some(t => card.IsPerformableOn(t));
            });

            const chosenCard = pickRandom(playable, rng);
            if (!chosenCard) {
                return { kind: 'endTurn' };
            }

            if (chosenCard.targetingType === TargetingType.NO_TARGETING) {
                return { kind: 'play', card: chosenCard };
            }

            const legalTargets = legalTargetsFor(chosenCard).filter(t => chosenCard.IsPerformableOn(t));
            const target = pickRandom(legalTargets, rng);
            return { kind: 'play', card: chosenCard, target };
        },

        chooseCardsFromHand({ min, max, candidates }): PlayableCard[] {
            const count = Math.min(candidates.length, min + Math.floor(rng() * (max - min + 1)));
            const pool = [...candidates];
            const chosen: PlayableCard[] = [];
            for (let i = 0; i < count && pool.length > 0; i++) {
                const idx = Math.floor(rng() * pool.length);
                chosen.push(pool.splice(idx, 1)[0]);
            }
            return chosen;
        },

        chooseCardsFromPool({ min, max, cardPool }): PlayableCard[] {
            const count = Math.min(cardPool.length, min + Math.floor(rng() * (max - min + 1)));
            const pool = [...cardPool];
            const chosen: PlayableCard[] = [];
            for (let i = 0; i < count && pool.length > 0; i++) {
                const idx = Math.floor(rng() * pool.length);
                chosen.push(pool.splice(idx, 1)[0]);
            }
            return chosen;
        }
    };
}
