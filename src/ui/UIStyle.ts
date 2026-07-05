// The Company's design language: a Victorian trading-house office rendered
// over the existing oil paintings. Every HQ panel should pull its colors,
// type, and chrome from here rather than inventing its own.

export const Palette = {
    // paper & ink (posted notices, ledgers)
    PAPER: 0xe4d5b0,
    PAPER_AGED: 0xd4c298,
    PAPER_SHADOW: 0x2a1d10,
    INK: '#2b1d12',
    INK_FADED: '#5a4630',

    // wood & brass (panel chrome, buttons)
    WOOD_DARK: 0x241610,
    WOOD_PANEL: 0x3a2418,
    BRASS: 0xb08d3c,
    BRASS_BRIGHT: 0xd4af5c,
    BRASS_TEXT: '#d4af5c',

    // status
    WAX_RED: 0x8a1a12,
    CRIMSON_TEXT: '#c03a2b',
    /** Selection state: aged copper, not bootstrap green. */
    VERDIGRIS: 0x3d5a4a,
    GOOD_GREEN: 0x2d5a2d,
    GOOD_TEXT: '#7fbf7f',
    DISABLED: 0x4a4038,
    DISABLED_TEXT: '#8a7a68',
    WHITE: '#f0e8d8',
} as const;

export const Fonts = {
    /** Display face for titles, headings, buttons (small caps). */
    DISPLAY: '"IM Fell English SC", Georgia, serif',
    /** Body face for descriptions and flavor. */
    BODY: '"IM Fell English", Georgia, serif',
    /** Fallback sans for dense mechanical text. */
    UTILITY: 'Arial, sans-serif',
} as const;

/**
 * Self-hosted typefaces (resources/Fonts, SIL OFL). Kick this off before the
 * game boots; scenes create their text long after these ~100KB files land.
 */
export function loadCompanyFonts(): void {
    if (typeof FontFace === 'undefined' || !document.fonts) return;
    const faces = [
        new FontFace('IM Fell English SC', 'url(resources/Fonts/IMFellEnglishSC-Regular.ttf)'),
        new FontFace('IM Fell English', 'url(resources/Fonts/IMFellEnglish-Regular.ttf)'),
    ];
    faces.forEach(face => {
        face.load()
            .then(loaded => document.fonts.add(loaded))
            .catch(err => console.warn('Font failed to load, falling back to serif:', err));
    });
}

/** A paper sheet with a soft drop shadow; the base of notices and ledgers. */
export function drawPaper(
    scene: Phaser.Scene, width: number, height: number, aged: boolean = false
): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    // drop shadow
    g.fillStyle(Palette.PAPER_SHADOW, 0.55);
    g.fillRect(-width / 2 + 5, -height / 2 + 6, width, height);
    // sheet
    g.fillStyle(aged ? Palette.PAPER_AGED : Palette.PAPER, 1);
    g.fillRect(-width / 2, -height / 2, width, height);
    // worn edge
    g.lineStyle(2, Palette.PAPER_SHADOW, 0.25);
    g.strokeRect(-width / 2, -height / 2, width, height);
    return g;
}

/** Dark wood panel with a brass border; the base of bars and plaques. */
export function drawWoodPanel(
    scene: Phaser.Scene, width: number, height: number, brassBorder: boolean = true
): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    g.fillStyle(Palette.PAPER_SHADOW, 0.5);
    g.fillRect(-width / 2 + 4, -height / 2 + 5, width, height);
    g.fillStyle(Palette.WOOD_PANEL, 0.96);
    g.fillRect(-width / 2, -height / 2, width, height);
    if (brassBorder) {
        g.lineStyle(2, Palette.BRASS, 0.9);
        g.strokeRect(-width / 2 + 3, -height / 2 + 3, width - 6, height - 6);
    }
    return g;
}

/** A wax seal showing 1-3 pips (contract difficulty). */
export function drawWaxSeal(
    scene: Phaser.Scene, radius: number, pips: number
): Phaser.GameObjects.Container {
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(2, 3, radius);
    g.fillStyle(Palette.WAX_RED, 1);
    g.fillCircle(0, 0, radius);
    g.fillStyle(0xa93226, 1);
    g.fillCircle(-radius * 0.25, -radius * 0.25, radius * 0.55);
    g.fillStyle(Palette.WAX_RED, 1);
    g.fillCircle(-radius * 0.2, -radius * 0.2, radius * 0.45);
    // Engraved tally marks read as "danger rating" better than abstract pips.
    const pipText = scene.add.text(0, 0, 'I'.repeat(pips), {
        fontFamily: Fonts.DISPLAY, fontSize: `${Math.round(radius * 0.9)}px`, color: '#f5d9a8',
    }).setOrigin(0.5);
    return scene.add.container(0, 0, [g, pipText]);
}

/** Full-screen dimmer so panel content stops fighting the background painting. */
export function drawBackdropDim(scene: Phaser.Scene, alpha: number = 0.45): Phaser.GameObjects.Rectangle {
    return scene.add.rectangle(
        scene.scale.width / 2, scene.scale.height / 2,
        scene.scale.width, scene.scale.height,
        0x0d0705, alpha
    );
}

/** Standard hover treatment: slight lift + brightness. */
export function applyHoverLift(obj: Phaser.GameObjects.Container, baseScale: number = 1): void {
    obj.setInteractive();
    obj.on('pointerover', () => obj.setScale(baseScale * 1.02));
    obj.on('pointerout', () => obj.setScale(baseScale));
}
