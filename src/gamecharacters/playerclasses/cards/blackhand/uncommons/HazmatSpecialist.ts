import { AbstractCardType } from "../../../../../Types";
import { TargetingType } from "../../../../AbstractCard";
import type { BaseCharacter } from "../../../../BaseCharacter";
import { Burning } from "../../../../buffs/standard/Burning";
import { Ward } from "../../../../buffs/standard/Ward";
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
		this.baseEnergyCost = 1;
	}

	override get description(): string {
		return `Grant ${this.getDisplayedBlock()} block and 1 Ward to ALL party members. Gain 1 Venture.`;
	}
	
	override InvokeCardEffects(targetCard?: AbstractCardType): void {
		this.forEachAlly(ally => {
			this.applyBlockToTarget(ally);	
			this.actionManager.applyBuffToCharacterOrCard(ally, new Ward(1), ally);
		});
		this.performActionOnRandomEnemy(enemy => {
			this.actionManager.applyBuffToCharacterOrCard(enemy, new Burning(this.getBaseMagicNumberAfterResourceScaling()), this.owningCharacter as BaseCharacter);
		});
	}
}
