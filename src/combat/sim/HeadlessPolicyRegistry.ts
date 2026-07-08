// Module-level seam so the two UI-blocking selection actions
// (RequireCardSelectionFromHandAction, SelectFromCardPoolAction) can check
// "is a headless policy driving this combat" without ActionManager's
// enqueueing methods (requireCardSelectionFromHand, selectFromCardPool)
// needing to know about IPlayPolicy at all -- those call sites (Rummage,
// AshesResource, SmogResource, BasicProcs, ReplicateArmaments) stay
// untouched. Set once per headless combat run by HeadlessCombat.ts; cleared
// when the run ends so a stray reference can't leak into a later live
// scene's combat.

import { IPlayPolicy } from './IPlayPolicy';

let activePolicy: IPlayPolicy | null = null;

export function setActiveHeadlessPolicy(policy: IPlayPolicy | null): void {
    activePolicy = policy;
}

export function getActiveHeadlessPolicy(): IPlayPolicy | null {
    return activePolicy;
}
