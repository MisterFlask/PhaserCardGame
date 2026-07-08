// IPlayPolicy: the decision-making seam headless combat needs in place of a
// human dragging cards onto targets. Two of ActionManager's queued actions
// block on a UI overlay for player input mid-resolution
// (RequireCardSelectionFromHandAction, SelectFromCardPoolAction) -- a
// headless run has no overlay to click, so HeadlessActionManager resolves
// both through whatever policy is active instead.
//
// This interface is intentionally minimal: "what do I play this turn" plus
// "how do I resolve an ad-hoc card-selection prompt (discard N, choose from
// a custom pool, etc.)". Card *targeting* for the main play loop is decided
// by choosePlay itself (it returns the target alongside the card), since
// legal-target selection is entangled with which card is chosen.

import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { BaseCharacterType } from '../../Types';

export type PlayChoice =
    | { kind: 'play'; card: PlayableCard; target?: BaseCharacterType }
    | { kind: 'endTurn' };

export interface IPlayPolicy {
    /** Called repeatedly during a player turn until it returns 'endTurn'.
     *  The caller (HeadlessCombat's turn loop) re-derives legal state after
     *  every play, so the policy only needs to make one decision per call. */
    choosePlay(): PlayChoice;

    /** Resolves a "choose N cards from your hand" prompt
     *  (RequireCardSelectionFromHandAction). Must return between min and max
     *  cards (inclusive) drawn from candidates, unless candidates.length <
     *  min, in which case the caller already short-circuits before invoking
     *  this. */
    chooseCardsFromHand(params: {
        name: string;
        instructions: string;
        min: number;
        max: number;
        candidates: PlayableCard[];
    }): PlayableCard[];

    /** Resolves a "choose N cards from this custom pool" prompt
     *  (SelectFromCardPoolAction), e.g. a reward or discovery pick. Return
     *  null to cancel (only meaningful when the prompt is cancellable). */
    chooseCardsFromPool(params: {
        name: string;
        instructions: string;
        min: number;
        max: number;
        cancellable: boolean;
        cardPool: PlayableCard[];
    }): PlayableCard[] | null;
}
