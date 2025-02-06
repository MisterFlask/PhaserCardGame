import { Robotic } from "../../gamecharacters/buffs/enemy_buffs/Robotic";
import { Lethality } from "../../gamecharacters/buffs/standard/Lethality";
import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { AbstractRelic } from "../AbstractRelic";

export class MachineEffigy extends AbstractRelic {
    private readonly BASE_STRENGTH = 2;

    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
        this.stackable = true;
        this.stacks = 1;
    }

    getDisplayName(): string {
        return "Machine Effigy";
    }

    getDescription(): string {
        return `If any enemies have the Robotic buff, your whole party gets ${this.BASE_STRENGTH * this.stacks} Strength.`;
    }

    onCombatStart(): void {
        const hasRoboticEnemy = this.combatState.enemies.some(enemy => 
            enemy.buffs.some(buff => buff instanceof Robotic)
        );

        if (hasRoboticEnemy) {
            this.combatState.playerCharacters.forEach(character => {
                this.actionManager.applyBuffToCharacterOrCard(character, new Lethality(this.BASE_STRENGTH * this.stacks));
            });
        }
    }
}
