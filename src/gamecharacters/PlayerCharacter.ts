import { AbstractRelic } from "../relics/AbstractRelic";
import { BaseCharacter } from "./BaseCharacter";
import { BaseCharacterClass } from "./BaseCharacterClass";
import { PlayableCard } from "./PlayableCard";

export class PlayerCharacter extends BaseCharacter {
    startingDeck: PlayableCard[] = [];
    cardsInMasterDeck: PlayableCard[];
    characterClass: BaseCharacterClass;

    /** Weeks of infirmary time remaining; 0 = fit for duty. */
    weeksWoundedRemaining: number = 0;
    /** Permanently lost to the campaign (killed on a sortie). */
    isDeceased: boolean = false;
    /**
     * Relic equipment slots (src/docs/relic_equipment_design.md). Cap is
     * Leveling.relicSlots(level); enforcement of the cap lives with callers
     * (CampaignUiState.equipRelic), not here — this is just storage.
     */
    equippedRelics: AbstractRelic[] = [];
    /**
     * Subset of equippedRelics that has been underwritten (£40 one-time,
     * purchased at the Barracks). A relic here is always also present in
     * equippedRelics; unequipping drops it from both arrays. Modeled as a
     * parallel array (membership = insured) rather than a field on
     * AbstractRelic itself, since AbstractRelic is outside this change's
     * file ownership.
     */
    insuredRelics: AbstractRelic[] = [];
    /** Cumulative XP earned on sorties. Pending promotions are always
     *  derived from this (see src/campaign/Leveling.ts); never store a
     *  "pending level" field. */
    xp: number = 0;
    /** Current soldier level (1-LEVEL_CAP). Promotions increment this. */
    level: number = 1;
    /** Soldiers at or past this much stress cannot be dispatched. */
    static readonly STRESS_DEPLOYMENT_LIMIT = 10;

    get isFitForDuty(): boolean {
        return !this.isDeceased
            && this.weeksWoundedRemaining <= 0
            && this.stress < PlayerCharacter.STRESS_DEPLOYMENT_LIMIT;
    }

    constructor({ name, portraitName, characterClass, description }
        : {name: string; portraitName: string; characterClass: BaseCharacterClass, description?: string}) {
        super({ name, portraitName, maxHitpoints: characterClass.startingMaxHp, description })
        this.cardsInMasterDeck = [];
        this.hitpoints = characterClass.startingMaxHp;
        this.maxHitpoints = characterClass.startingMaxHp;
        this.characterClass = characterClass;
    }

    removeCard(card: PlayableCard) {
        this.cardsInMasterDeck = this.cardsInMasterDeck.filter(c => c?.id !== card?.id);
    }

    addCard(card: PlayableCard) {
        card.owningCharacter = this;
        this.cardsInMasterDeck.push(card);
    }
} 