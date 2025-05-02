import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { Lethality } from "../gamecharacters/buffs/standard/Lethality";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { GameState } from "../rules/GameState";
import { AbstractConsumable } from "./AbstractConsumable";

export class TacticalAssessmentForm extends AbstractConsumable {
    private lethalityAmount: number = 1;

    constructor() {
        super();
        this.targetingType = TargetingType.NO_TARGETING; // Not directly usable
        this.rarity = EntityRarity.UNCOMMON;
        this.basePrice = 200;
        this.uses = 1;
        this.tint = 0xFFA500; // Orange tint for performance
    }

    override getDisplayName(): string {
        return "Form 7-d: Tactical Assessment";
    }

    override getDescription(): string {
        return `At the start of combat, all allies gain ${this.lethalityAmount} Lethality.`;
    }

    onCombatStart(): void {
        const gameState = GameState.getInstance();
        this.actionManager.DoAThing("Apply Tactical Assessment", () => {
            gameState.combatState.playerCharacters.forEach((character: BaseCharacter) => {
                this.actionManager.applyBuffToCharacterOrCard(character, new Lethality(this.lethalityAmount));
            });
        });
    }

    override onUse(target: BaseCharacter): boolean {
        // This consumable is not directly usable
        return false;
    }

    override onPurchase(): void {
        console.log("Tactical Assessment Form purchased!");
    }
} 