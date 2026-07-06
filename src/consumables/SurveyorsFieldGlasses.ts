import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { Lethality } from "../gamecharacters/buffs/standard/Lethality";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { GameState } from "../rules/GameState";
import { AbstractConsumable } from "./AbstractConsumable";

export class SurveyorsFieldGlasses extends AbstractConsumable {
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
        return "Surveyor's Field Glasses";
    }

    override getDescription(): string {
        return `At the start of combat, all allies gain ${this.lethalityAmount} Lethality.`;
    }

    getTooltip(): string {
        return `${this.getDescription()}\n[i]Brass-barreled optics, Ordnance Survey pattern. Finds the gap in a demon's hide before the demon does.[/i]`;
    }

    onCombatStart(): void {
        const gameState = GameState.getInstance();
        this.actionManager.DoAThing("Apply Surveyor's Field Glasses", () => {
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
        console.log("Surveyor's Field Glasses purchased!");
    }
}