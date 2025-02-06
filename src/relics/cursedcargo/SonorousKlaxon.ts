import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { AbstractRelic } from "../AbstractRelic";

export class SonorousKlaxon extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
    }

    override getDisplayName(): string {
        return "Sonorous Klaxon";
    }

    override getDescription(): string {
        return "At the beginning of combat, all enemies start with an additional 20% max and current HP.";
    }

    override onCombatStart(): void {
        this.forEachEnemy((enemy) => {
            enemy.maxHitpoints = Math.floor(enemy.maxHitpoints * 1.2);
            enemy.hitpoints = enemy.maxHitpoints;
        });
    }
}