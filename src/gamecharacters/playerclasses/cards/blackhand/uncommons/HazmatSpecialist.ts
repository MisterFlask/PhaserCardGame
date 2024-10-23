import { AbstractCardType } from "../../../../../Types";
import { TargetingType } from "../../../../AbstractCard";
import type { BaseCharacter } from "../../../../BaseCharacter";
import { Blessed } from "../../../../buffs/standard/Blessed";
import { Burning } from "../../../../buffs/standard/Burning";
import { PlayableCard } from "../../../../PlayableCard";

export class HazmatSpecialist extends PlayableCard {
	constructor() {
		super({
			name: "Hazmat Specialist",
			description: `_`,
			portraitName: "hazmat-suit",
			targetingType: TargetingType.NO_TARGETING,
		});
		this.baseBlock = 6;
		this.baseMagicNumber = 3;
		this.energyCost = 1;
	}

	override get description(): string {
		return `Grant ${this.getDisplayedBlock()} block and 1 Blessed to ALL party members. Apply ${this.getDisplayedMagicNumber()} Burning to a random enemy.`;
	}
	
	override InvokeCardEffects(targetCard?: AbstractCardType): void {
		this.forEachAlly(ally => {
			this.applyBlockToTarget(ally);	
			this.actionManager.applyBuffToCharacter(ally, new Blessed(1), ally);
		});
		this.performActionOnRandomEnemy(enemy => {
			this.actionManager.applyBuffToCharacter(enemy, new Burning(this.getBaseMagicNumberAfterResourceScaling()), this.owner as BaseCharacter);
		});
	}
}
