import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
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
		this.baseBlock = 4;
		this.energyCost = 1;
		this.buffs.push(new ExhaustBuff());
	}

	override get description(): string {
		return `Apply ${this.getDisplayedMagicNumber()} Burning to ALL enemies. All party members gain ${this.getDisplayedBlock()} Block, plus 1 for each Burning on the enemy. Exhaust.`;
	}
	
	override InvokeCardEffects(): void {
		let burningCount = 0;
		this.forEachEnemy(enemy => {
			burningCount += enemy.getBuffStacks(new Burning(1).getName());
			this.actionManager.applyBuffToCharacter(enemy as BaseCharacter, new Burning(this.getBaseMagicNumberAfterResourceScaling()), this.owner as BaseCharacter);
		});

		this.forEachAlly(ally => {
			this.applyBlockToTarget(ally);
		});
	}
}
