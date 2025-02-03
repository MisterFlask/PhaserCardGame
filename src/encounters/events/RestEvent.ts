import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { PlayableCard } from "../../gamecharacters/PlayableCard";
import { CardModifier } from "../../rules/modifiers/AbstractCardModifier";
import { UpgradePreviewOverlay } from "../../screens/subcomponents/CharacterDeckUpgradeOverlay";
import { DepthManager } from "../../ui/DepthManager";

class RestChoice extends AbstractChoice {
    constructor() {
        super(
            "Rest (Heal 20% HP)",
            "Heal all characters for 20% of their max HP"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "You take some time to rest and recover. The warmth of nearby hellfire soothes your wounds.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const gameState = this.gameState();
        gameState.currentRunCharacters.forEach(character => {
            const healAmount = Math.floor(character.maxHitpoints * 0.2);
            character.hitpoints = Math.min(character.maxHitpoints, character.hitpoints + healAmount);
        });
    }
}

export class UpgradeChoice extends AbstractChoice {
    restSiteUpgradeOptions: CardModifier[];
    constructor(restSiteUpgradeOptions: CardModifier[]) {
        super("Upgrade Deck", "Upgrade a card in your deck");
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Better weapon. Cool.";
        this.restSiteUpgradeOptions = restSiteUpgradeOptions;
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        // Instead of finishing immediately, show the upgrade overlay.
        const scene = this.actionManager().scene; 
        const candidateCards = this.gameState().masterDeckAllCharacters
        // `getAllUpgradableCards()` is an example function. Use whatever logic you have.

        const upgradeFunction = (card: PlayableCard): PlayableCard[] => {
            // Return the available upgrades for `card`
            const upgrades: PlayableCard[] = [];
            
            // Add each rest site upgrade option that's valid for this card
            for (const upgradeOption of this.restSiteUpgradeOptions) {
                if (upgradeOption.eligible(card)) {
                    const upgradedCard = card.Copy();
                    upgradeOption.modifier(upgradedCard);
                    upgrades.push(upgradedCard);
                }
            }

            return upgrades;
        };

        const overlay = new UpgradePreviewOverlay(scene, candidateCards, upgradeFunction);
        overlay.setDepth(DepthManager.getInstance().MAP_OVERLAY + 60);

        overlay.showCandidates();

        // When user chooses an upgrade
        overlay.onUpgradeSelected = (oldCard: PlayableCard, newCard: PlayableCard) => {
            // Apply the upgrade (example logic)
            // remove old card
            oldCard.owningCharacter?.removeCard(oldCard)
            // add new card
            oldCard.owningCharacter?.addCard(newCard)

            // Now proceed to the next event
            scene.events.emit('abstractEvent:launch', this.nextEvent);
        };

        // When user clicks "nevermind"
        overlay.onNeverMind = () => {
            // The user can now pick another option from the same event
            scene.events.emit('abstractEvent:launch', this.parentEvent);
        };
    }
}


class ScavengeChoice extends AbstractChoice {
    constructor() {
        super(
            "Scavenge (Gain 30 Hell Currency)",
            "Search the area for resources"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "You search the area and find some valuable resources among the ashes and brimstone.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const gameState = this.gameState();
        gameState.denarians += 30;
    }
}

export class RestEvent extends AbstractEvent {
    restSiteUpgradeOptions: CardModifier[];
    constructor(restSiteUpgradeOptions: CardModifier[]) {
        super();
        this.name = "Rest Site";
        this.restSiteUpgradeOptions = restSiteUpgradeOptions;
        this.portraitName = "placeholder_event_background_2";
        this.description = "You've found a relatively safe spot to rest. The ambient heat from nearby hellfire provides a strange comfort. You could take this opportunity to recover, or search the area for resources.";
        this.choices = [
            new RestChoice(),
            new ScavengeChoice(),
            new UpgradeChoice(this.restSiteUpgradeOptions)
        ];
    }
} 