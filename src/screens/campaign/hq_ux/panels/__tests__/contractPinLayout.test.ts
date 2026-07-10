import { describe, expect, it } from 'vitest';
import {
    Circle, computePinPositions, PIN_EXTENT, PIN_GAP_MARGIN, Rect,
} from '../contractPinLayout';

// Matches the panel's real constants (see ContractBoardPanel.ts): game
// canvas is 1920x1080, MAP_RECT is the survey map's screen rect, and the
// notice keep-out / compass rose mirror the panel's own derivation so this
// test exercises production geometry, not a toy setup.
const MAP_RECT: Rect = { x: 32, y: 110, width: 1344, height: 896 };

const NOTICE_W = 380;
const NOTICE_H = 240;
const NOTICE_POS = { x: 270, y: 880 };
const NOTICE_KEEPOUT_MARGIN = 15;
const NOTICE_KEEPOUT: Rect = {
    x: NOTICE_POS.x - NOTICE_W / 2 - NOTICE_KEEPOUT_MARGIN,
    y: NOTICE_POS.y - NOTICE_H / 2 - NOTICE_KEEPOUT_MARGIN,
    width: NOTICE_W + NOTICE_KEEPOUT_MARGIN * 2,
    height: NOTICE_H + NOTICE_KEEPOUT_MARGIN * 2,
};

const COMPASS_ROSE_NORM = { x: 0.80, y: 0.76, radiusFrac: 0.12 };
const COMPASS_ROSE: Circle = {
    x: MAP_RECT.x + COMPASS_ROSE_NORM.x * MAP_RECT.width,
    y: MAP_RECT.y + COMPASS_ROSE_NORM.y * MAP_RECT.height,
    radius: COMPASS_ROSE_NORM.radiusFrac * MAP_RECT.width,
};

function pinBounds(p: { x: number; y: number }) {
    return {
        left: p.x - PIN_EXTENT.side,
        right: p.x + PIN_EXTENT.side,
        top: p.y - PIN_EXTENT.up,
        bottom: p.y + PIN_EXTENT.down,
    };
}

function overlaps(a: { x: number; y: number }, b: { x: number; y: number }, margin: number): boolean {
    const ba = pinBounds(a);
    const bb = pinBounds(b);
    return ba.left - margin < bb.right && ba.right + margin > bb.left
        && ba.top - margin < bb.bottom && ba.bottom + margin > bb.top;
}

function expectInsideMap(p: { x: number; y: number }) {
    const b = pinBounds(p);
    expect(b.left).toBeGreaterThanOrEqual(MAP_RECT.x);
    expect(b.right).toBeLessThanOrEqual(MAP_RECT.x + MAP_RECT.width);
    expect(b.top).toBeGreaterThanOrEqual(MAP_RECT.y);
    expect(b.bottom).toBeLessThanOrEqual(MAP_RECT.y + MAP_RECT.height);
}

function expectClearOfNotice(p: { x: number; y: number }) {
    const b = pinBounds(p);
    const nk = {
        left: NOTICE_KEEPOUT.x, right: NOTICE_KEEPOUT.x + NOTICE_KEEPOUT.width,
        top: NOTICE_KEEPOUT.y, bottom: NOTICE_KEEPOUT.y + NOTICE_KEEPOUT.height,
    };
    const intersects = b.left < nk.right && b.right > nk.left && b.top < nk.bottom && b.bottom > nk.top;
    expect(intersects).toBe(false);
}

function expectClearOfCompassRose(p: { x: number; y: number }) {
    const b = pinBounds(p);
    const nearestX = Math.min(Math.max(COMPASS_ROSE.x, b.left), b.right);
    const nearestY = Math.min(Math.max(COMPASS_ROSE.y, b.top), b.bottom);
    const dx = nearestX - COMPASS_ROSE.x;
    const dy = nearestY - COMPASS_ROSE.y;
    expect(dx * dx + dy * dy).toBeGreaterThanOrEqual(COMPASS_ROSE.radius * COMPASS_ROSE.radius);
}

describe('computePinPositions', () => {
    it('places 7 contracts in one region with no overlapping extents, all on-map and clear of keep-outs', () => {
        const items = Array.from({ length: 7 }, () => ({ regionName: 'Styx Delta' }));
        const positions = computePinPositions(items, MAP_RECT, NOTICE_KEEPOUT, COMPASS_ROSE);

        expect(positions).toHaveLength(7);

        positions.forEach((p) => {
            expectInsideMap(p);
            expectClearOfNotice(p);
            expectClearOfCompassRose(p);
        });

        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                expect(overlaps(positions[i], positions[j], PIN_GAP_MARGIN)).toBe(false);
            }
        }
    });

    it('is deterministic: identical input twice produces identical output', () => {
        const items = Array.from({ length: 7 }, () => ({ regionName: 'Styx Delta' }));
        const first = computePinPositions(items, MAP_RECT, NOTICE_KEEPOUT, COMPASS_ROSE);
        const second = computePinPositions(items, MAP_RECT, NOTICE_KEEPOUT, COMPASS_ROSE);
        expect(second).toEqual(first);
    });

    it('spreads contracts across all 4 known regions plus one unknown region with no overlaps', () => {
        const items = [
            { regionName: 'Styx Delta' },
            { regionName: 'Styx Delta' },
            { regionName: 'Deep France' },
            { regionName: 'Dis Foundry Belt' },
            { regionName: 'Brimstone Badlands' },
            { regionName: 'Some Unmapped Wastes' }, // falls back to DEFAULT_REGION_ANCHOR
        ];
        const positions = computePinPositions(items, MAP_RECT, NOTICE_KEEPOUT, COMPASS_ROSE);

        expect(positions).toHaveLength(items.length);

        positions.forEach((p) => {
            expectInsideMap(p);
            expectClearOfNotice(p);
            expectClearOfCompassRose(p);
        });

        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                expect(overlaps(positions[i], positions[j], PIN_GAP_MARGIN)).toBe(false);
            }
        }
    });
});
