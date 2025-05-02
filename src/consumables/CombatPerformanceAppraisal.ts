import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { Lethality } from "../gamecharacters/buffs/standard/Lethality";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { GameState } from "../rules/GameState";
import { AbstractConsumable } from "./AbstractConsumable";

export class CombatPerformanceAppraisal extends AbstractConsumable {
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
        return "Form 3-c: Combat Performance Appraisal";
    }

    override getDescription(): string {
        return `At the start of combat, all allies gain ${this.lethalityAmount} Lethality.`;
    }

    onCombatStart(): void {
        if (this.uses <= 0) {
            return;
        }
        
        const gameState = GameState.getInstance();
        this.actionManager.DoAThing("Apply Combat Performance Appraisal", () => {
            gameState.combatState.playerCharacters.forEach((character: BaseCharacter) => {
                this.actionManager.applyBuffToCharacterOrCard(character, new Lethality(this.lethalityAmount));
            });
            this.uses--;
        });
    }

    override onUse(target: BaseCharacter): boolean {
        // This consumable is not directly usable
        return false;
    }

    override onPurchase(): void {
        console.log("Combat Performance Appraisal purchased!");
    }
} 