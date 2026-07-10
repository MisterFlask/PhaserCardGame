/**
 * Pure layout math for scattering contract pins on the survey map.
 *
 * Phaser-free by design: the panel (ContractBoardPanel) does the drawing,
 * this module only computes deterministic screen positions so it can be
 * unit-tested under vitest without a browser. See house rule 1.
 */

export interface Rect { x: number; y: number; width: number; height: number; }
export interface Circle { x: number; y: number; radius: number; }
export interface Point { x: number; y: number; }

/** Normalized (0..1) image-space anchor for a region's pin cluster, plus
 *  where the (always-drawn) region label sits. Unknown regions fall back to
 *  DEFAULT_REGION_ANCHOR with no label — a data table, not per-region
 *  branches, per house rule 6. */
export interface RegionAnchor {
    anchor: { x: number; y: number };
    label?: { x: number; y: number };
}

export const REGION_ANCHORS: Record<string, RegionAnchor> = {
    'Styx Delta': { anchor: { x: 0.22, y: 0.60 }, label: { x: 0.24, y: 0.73 } },
    'Deep France': { anchor: { x: 0.46, y: 0.47 }, label: { x: 0.46, y: 0.61 } },
    'Dis Foundry Belt': { anchor: { x: 0.75, y: 0.25 }, label: { x: 0.75, y: 0.41 } },
    'Brimstone Badlands': { anchor: { x: 0.93, y: 0.42 }, label: { x: 0.91, y: 0.55 } },
};
export const DEFAULT_REGION_ANCHOR: RegionAnchor = { anchor: { x: 0.55, y: 0.72 } };

export const PIN_TAG_W = 170;
export const PIN_TAG_H = 54;

/** Scatter geometry for same-region contracts: first contract sits on the
 *  region anchor, subsequent ones fan out at increasing angle/radius. No
 *  randomness so pins are stable across rebuilds. */
export const SCATTER_ANGLE_STEP = 2.4;
export const SCATTER_RADIUS_BASE = 60;
export const SCATTER_RADIUS_STEP = 18;
/** How many scatter slots to probe before falling back to the anchor. Pin
 *  extents are large relative to the map, and each candidate slot must now
 *  also clear every previously-placed pin, so a full board needs more
 *  headroom than the old keep-out-only search did. */
export const SCATTER_MAX_SLOTS = 96;

/** A pin's visual extent around its position: brass tack + seal above the
 *  point, parchment tag hanging below. Used to keep pins fully on the map,
 *  fully clear of the keep-out zones, and non-overlapping with each other. */
export const PIN_EXTENT = { side: PIN_TAG_W / 2, up: 22, down: PIN_TAG_H + 14 };

/** Minimum gap enforced between any two placed pins' extents, so tags never
 *  visually touch even when both slots are technically "clear". */
export const PIN_GAP_MARGIN = 8;

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/** Axis-aligned bounding box for a pin centered at (x, y). */
function pinBounds(x: number, y: number): { left: number; right: number; top: number; bottom: number } {
    return {
        left: x - PIN_EXTENT.side,
        right: x + PIN_EXTENT.side,
        top: y - PIN_EXTENT.up,
        bottom: y + PIN_EXTENT.down,
    };
}

function rectsOverlap(
    a: { left: number; right: number; top: number; bottom: number },
    b: { left: number; right: number; top: number; bottom: number },
    margin: number,
): boolean {
    return a.left - margin < b.right && a.right + margin > b.left
        && a.top - margin < b.bottom && a.bottom + margin > b.top;
}

/** Normalized image coords (0..1, top-left origin) to screen coords, via a
 *  fixed map rect. */
function imageToScreen(mapRect: Rect, nx: number, ny: number): Point {
    return {
        x: mapRect.x + nx * mapRect.width,
        y: mapRect.y + ny * mapRect.height,
    };
}

export function regionAnchorFor(regionName: string): RegionAnchor {
    return REGION_ANCHORS[regionName] ?? DEFAULT_REGION_ANCHOR;
}

/** Deterministic scatter offset (screen px) for slot k of a region's
 *  fan-out: slot 0 is the anchor itself, later slots spiral outward. */
function scatterOffset(slot: number): { dx: number; dy: number } {
    if (slot === 0) return { dx: 0, dy: 0 };
    const angle = slot * SCATTER_ANGLE_STEP;
    const radius = SCATTER_RADIUS_BASE + slot * SCATTER_RADIUS_STEP;
    return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius };
}

/** Whether a pin centered at (x, y) — with its full tack + tag extent —
 *  stays on the map and clear of the notice cartouche and compass rose.
 *  Does NOT check other pins; that's handled separately so the caller can
 *  track cumulative placements. */
function clearOfStaticKeepOuts(x: number, y: number, mapRect: Rect, noticeKeepOut: Rect, compassRose: Circle): boolean {
    const b = pinBounds(x, y);

    // Fully inside the map image.
    if (b.left < mapRect.x || b.right > mapRect.x + mapRect.width) return false;
    if (b.top < mapRect.y || b.bottom > mapRect.y + mapRect.height) return false;

    // Clear of the docked-notice cartouche (always reserved, so pins don't
    // jump around when a contract is selected/deselected).
    const nk = {
        left: noticeKeepOut.x, right: noticeKeepOut.x + noticeKeepOut.width,
        top: noticeKeepOut.y, bottom: noticeKeepOut.y + noticeKeepOut.height,
    };
    if (b.left < nk.right && b.right > nk.left && b.top < nk.bottom && b.bottom > nk.top) {
        return false;
    }

    // Clear of the compass rose (circle-vs-rect test).
    const nearestX = clamp(compassRose.x, b.left, b.right);
    const nearestY = clamp(compassRose.y, b.top, b.bottom);
    const dx = nearestX - compassRose.x;
    const dy = nearestY - compassRose.y;
    if (dx * dx + dy * dy < compassRose.radius * compassRose.radius) return false;

    return true;
}

/**
 * Compute deterministic screen positions for a set of contract pins,
 * grouped by region, such that each pin's full extent stays inside the map,
 * clear of the notice keep-out and compass rose, and non-overlapping with
 * every other placed pin (with a small gap margin).
 *
 * `items` is processed in order; each item's region determines its spiral's
 * center (REGION_ANCHORS, or DEFAULT_REGION_ANCHOR for unknown regions).
 * For each item, the spiral is walked outward from slot 0 and the item
 * takes the *first* slot clear of the map edge, the static keep-outs, and
 * every pin already placed by an earlier item (regardless of region) — so
 * later pins steer around earlier ones instead of independently
 * re-discovering the same "first N valid slots" and colliding. Deterministic
 * for a given input order — no randomness — so pins are stable across
 * rebuilds.
 */
export function computePinPositions(
    items: { regionName: string }[],
    mapRect: Rect,
    noticeKeepOut: Rect,
    compassRose: Circle,
): Point[] {
    const placed: { left: number; right: number; top: number; bottom: number }[] = [];
    const results: Point[] = [];

    for (const item of items) {
        const { anchor } = regionAnchorFor(item.regionName);
        const base = imageToScreen(mapRect, anchor.x, anchor.y);

        let placedPos: Point | null = null;
        for (let slot = 0; slot < SCATTER_MAX_SLOTS; slot++) {
            const { dx, dy } = scatterOffset(slot);
            const x = base.x + dx;
            const y = base.y + dy;
            if (!clearOfStaticKeepOuts(x, y, mapRect, noticeKeepOut, compassRose)) continue;

            const candidateBounds = pinBounds(x, y);
            const collides = placed.some(p => rectsOverlap(candidateBounds, p, PIN_GAP_MARGIN));
            if (collides) continue;

            placedPos = { x, y };
            break;
        }

        // Pathological fallback (should never happen with sane anchors and
        // a reasonably sized board): stack on the anchor rather than vanish.
        const finalPos = placedPos ?? base;
        placed.push(pinBounds(finalPos.x, finalPos.y));
        results.push(finalPos);
    }

    return results;
}
