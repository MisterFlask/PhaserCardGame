import Phaser from 'phaser';

/**
 * Sound key registry + a tiny Phaser-side SoundManager singleton.
 *
 * One module owns key names (house rule: registries over scattered play()
 * calls) so call sites never hardcode a filename or key string.
 *
 * Every public method on SoundManager is defensive: CI's headless browser
 * (npm run smoke) has no audio device, and Phaser's WebAudio sound system
 * can throw or silently fail to decode in that environment. Nothing here may
 * ever throw — a missing key, a missing scene, or a failed play() must all
 * be no-ops so gameplay code that plays a sound never needs its own
 * try/catch.
 */
export default class SoundUtils {
    /** Files served relative to the page, same convention as ImageUtils. */
    private static readonly prefix = 'Sounds/Effects/';

    /** key -> filename. Add new sounds here; nowhere else needs to know the
     *  filename. Keys are what call sites and the loader both use. */
    public static readonly sounds: Record<string, string> = {
        ui_click: 'click1.ogg',
        ui_rollover: 'rollover6.ogg',
        card_whoosh: 'card-whoosh.ogg',
        damage_thud: 'damage-thud.ogg',
        board_meeting_sting: 'board-meeting-sting.ogg',
    };

    /** localStorage key for the mute flag. Deliberately NOT part of the
     *  campaign save (SaveManager) — audio preference is a device setting,
     *  not campaign state, and must survive "New Campaign" wipes. */
    private static readonly MUTE_STORAGE_KEY = 'eic_audio_muted';

    /**
     * Queue every registered sound onto the Phaser loader. Call from each
     * scene's preload alongside ImageUtils, e.g.:
     *   SoundUtils.loadAllSounds(this.load);
     */
    public static loadAllSounds(loader: Phaser.Loader.LoaderPlugin): void {
        for (const key in SoundUtils.sounds) {
            const file = SoundUtils.sounds[key];
            loader.audio(key, `resources/${SoundUtils.prefix}${file}`);
        }
    }

    public static isMuted(): boolean {
        try {
            return localStorage.getItem(SoundUtils.MUTE_STORAGE_KEY) === 'true';
        } catch {
            // localStorage unavailable (e.g. sandboxed iframe, headless
            // context) - default to unmuted; play() is still safe to call.
            return false;
        }
    }

    public static setMuted(muted: boolean): void {
        try {
            localStorage.setItem(SoundUtils.MUTE_STORAGE_KEY, muted ? 'true' : 'false');
        } catch {
            // Nothing to persist to; the in-memory toggle still works for
            // the current session via the scene reading isMuted() each time.
        }
    }

    public static toggleMuted(): boolean {
        const next = !SoundUtils.isMuted();
        SoundUtils.setMuted(next);
        return next;
    }

    /**
     * Play a registered sound key on the given scene, at the given volume
     * (default quiet). No-ops (with a console breadcrumb, not a throw) if:
     * muted, the scene/sound system isn't live, the key isn't registered,
     * the audio file never finished loading (cache miss), or Phaser's sound
     * playback throws for any reason (no audio device in headless CI).
     */
    public static play(scene: Phaser.Scene | undefined | null, key: string, volume: number = 0.4): void {
        try {
            if (SoundUtils.isMuted()) {
                return;
            }
            if (!scene || !scene.sys || !scene.sys.isActive()) {
                return;
            }
            if (!SoundUtils.sounds[key]) {
                console.warn(`SoundUtils.play: unknown sound key "${key}"`);
                return;
            }
            if (!scene.cache.audio.exists(key)) {
                // Not loaded (or still loading) - fail silent rather than
                // block gameplay on audio.
                console.debug(`SoundUtils.play: "${key}" not yet in the audio cache, skipping`);
                return;
            }
            scene.sound.play(key, { volume });
        } catch (err) {
            // CI headless Chrome has no audio device; Phaser's WebAudio
            // backend can throw on play(). Never let sound break gameplay.
            console.debug(`SoundUtils.play: playback failed for "${key}" (non-fatal)`, err);
        }
    }
}
