import { TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { Smoldering } from "../../../buffs/blackhand/Smoldering";
import { PlayableCard } from "../../../PlayableCard";

export class HazmatSpecialist extends PlayableCard {
	constructor() {
		super({
			name: "Hazmat Specialist",
			description: `_`,
			portraitName: "hazmat-suit",
			targetingType: TargetingType.NO_TARGETING,
		});
		this.baseBlock = 10;
		this.baseMagicNumber = 2;
		this.energyCost = 2;
	}

	override get description(): string {
		return `Grant ${this.getDisplayedBlock()} block. Apply ${this.getDisplayedMagicNumber()} Smoldering to a random enemy.`;
	}
	
	override InvokeCardEffects(): void {
		this.applyBlockToTarget(this.owner);
		
		this.performActionOnRandomEnemy(enemy => {
			this.actionManager.applyBuffToCharacter(enemy, new Smoldering(this.getBaseMagicNumberAfterResourceScaling()), this.owner as BaseCharacter);
		});
	}
}