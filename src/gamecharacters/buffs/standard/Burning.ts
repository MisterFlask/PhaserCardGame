import { GameState } from "../../../rules/GameState";
import { TextGlyphs } from "../../../text/TextGlyphs";
import { FlamesAmplifierBuff } from "../../playerclasses/cards/blackhand/rares/Pyronox";
import { AbstractBuff } from "../AbstractBuff";

export class Burning extends AbstractBuff {
    private readonly baseDamage: number = 4;

    override getDisplayName(): string {
        return "Burning";
    }

    override getDescription(): string {
        const totalDamage = this.baseDamage + GameState.getInstance().combatState.combatResources.powder.value;
        return `At the end of turn, take ${totalDamage} damage for ${this.getStacksDisplayText()} turns. Damage increases with ${TextGlyphs.getInstance().ashesIcon}`;
    }

    constructor(stacks: number = 1) {
        super();
        this.imageName = "burning-icon"; // Replace with actual icon name
        this.stacks = stacks;
        this.stackable = true;
    }
    
    override onTurnEnd(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            const powderAmount = GameState.getInstance().combatState.combatResources.powder.value;
            var totalDamage = this.baseDamage + powderAmount;

            // Check for FlamesAmplifier buff and increase damage
            const flamesAmplifierBuff = owner.buffs.find(buff => buff instanceof FlamesAmplifierBuff);
            if (flamesAmplifierBuff) {
                const amplifierAmount = flamesAmplifierBuff.stacks;
                totalDamage += amplifierAmount;
                console.log(`Burning damage increased by ${amplifierAmount} due to Flames Amplifier`);
            }

            // Apply burning damage
            this.pulseBuff();
            this.actionManager.dealDamage({ baseDamageAmount: totalDamage, target: owner, fromAttack: false });
            console.log(`${owner.name} took ${totalDamage} burning damage (${this.baseDamage} base + ${powderAmount} Powder)`);

            // Reduce stacks by 1
            this.stacks--;


        }
    }
}
