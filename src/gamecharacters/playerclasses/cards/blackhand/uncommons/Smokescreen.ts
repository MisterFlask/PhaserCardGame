import { TargetingType } from "../../../../AbstractCard";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { Burning } from "../../../../buffs/standard/Burning";
import { PlayableCard } from "../../../../PlayableCard";

export class Smokescreen extends PlayableCard {
	constructor() {
		super({
			name: "Smokescreen",
			description: `_`,
			portraitName: "smoke-bomb",
			targetingType: TargetingType.NO_TARGETING,
		});
		this.baseMagicNumber = 2;
		this.baseBlock = 6;
		this.baseEnergyCost = 1;
		this.buffs.push(new ExhaustBuff());
	}

	override get description(): string {
		return `All party members gain ${this.getDisplayedBlock()} Block, plus 1 for each stack of Burning on anyone. Gain ${this.getDisplayedMagicNumber()} Smog.`;
	}
	
	override InvokeCardEffects(): void {
		let burningCount = 0;
		this.forEachEnemy(enemy => {
			burningCount += enemy.getBuffStacks(new Burning(1).getBuffCanonicalName());
		});
		this.forEachAlly(ally => {
			burningCount += ally.getBuffStacks(new Burning(1).getBuffCanonicalName());
		});

		this.forEachAlly(ally => {
			this.applyBlockToTarget(ally, burningCount + this.getBaseBlockAfterResourceScaling());
		});

		this.actionManager.modifySmog(this.getBaseMagicNumberAfterResourceScaling());
	}
}
