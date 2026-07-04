import { CampaignSave, SAVE_FORMAT_VERSION, SAVE_STORAGE_KEY } from "./SaveDTOs";
import { CampaignSerializer } from "./CampaignSerializer";

/**
 * localStorage persistence for the campaign. Saves happen automatically at
 * the HQ (arrival + purchases); there is deliberately no mid-sortie saving,
 * so quitting during a sortie resumes from the pre-launch HQ state.
 */
export class SaveManager {
    private static hasAttemptedInitialLoad = false;

    public static hasSave(): boolean {
        try {
            return localStorage.getItem(SAVE_STORAGE_KEY) !== null;
        } catch {
            return false;
        }
    }

    public static save(): void {
        try {
            const save = CampaignSerializer.toSave();
            localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));
            console.log(`Campaign saved (week ${save.calendar.week}, £${save.moneyInVault}).`);
        } catch (e) {
            console.error("Failed to save campaign:", e);
        }
    }

    /**
     * Restores a saved campaign onto the live singletons. Runs at most once
     * per app session (the HQ scene re-creates on every sortie return, and
     * those returns must not clobber live state with the older save).
     */
    public static loadOnceOnBoot(): boolean {
        if (this.hasAttemptedInitialLoad) return false;
        this.hasAttemptedInitialLoad = true;

        let raw: string | null = null;
        try {
            raw = localStorage.getItem(SAVE_STORAGE_KEY);
        } catch {
            return false;
        }
        if (!raw) return false;

        try {
            const save = JSON.parse(raw) as CampaignSave;
            if (save.version !== SAVE_FORMAT_VERSION) {
                console.warn(`Save version ${save.version} != ${SAVE_FORMAT_VERSION}; starting fresh.`);
                return false;
            }
            CampaignSerializer.applySave(save);
            console.log(`Campaign restored (week ${save.calendar.week}, £${save.moneyInVault}).`);
            return true;
        } catch (e) {
            console.error("Failed to load campaign save; starting fresh:", e);
            return false;
        }
    }

    public static deleteSave(): void {
        try {
            localStorage.removeItem(SAVE_STORAGE_KEY);
            console.log("Campaign save deleted.");
        } catch (e) {
            console.error("Failed to delete campaign save:", e);
        }
    }
}
