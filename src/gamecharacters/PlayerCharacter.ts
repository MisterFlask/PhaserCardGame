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