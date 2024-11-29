import { Robotic } from "../../gamecharacters/buffs/enemy_buffs/Robotic";
import { Lethality } from "../../gamecharacters/buffs/standard/Strong";
import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class MachineEffigy extends AbstractRelic {
    constructor() {
        super();
        this.name = "Machine Effigy";
        this.description = "If any enemies have the Robotic buff, your whole party gets 2 Strength.";
        this.rarity = EntityRarity.COMMON;
    }

    onCombatStart(): void {
        const hasRoboticEnemy = this.combatState.enemies.some(enemy => 
            enemy.buffs.some(buff => buff instanceof Robotic)
        );

        if (hasRoboticEnemy) {
            this.combatState.playerCharacters.forEach(character => {
                this.actionManager.applyBuffToCharacterOrCard(character, new Lethality(2));
            });
        }
    }
}
