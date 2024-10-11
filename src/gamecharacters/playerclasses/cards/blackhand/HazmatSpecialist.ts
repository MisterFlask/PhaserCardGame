import { AbstractCardType } from "../../../../Types";
import { TargetingType } from "../../../AbstractCard";
import type { BaseCharacter } from "../../../BaseCharacter";
import { Smoldering } from "../../../buffs/blackhand/Smoldering";
import { Blessed } from "../../../buffs/standard/Blessed";
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
		return `Grant ${this.getDisplayedBlock()} block and 1 Artifact. Apply ${this.getDisplayedMagicNumber()} Smoldering to a random enemy.`;
	}
	
	override InvokeCardEffects(targetCard?: AbstractCardType): void {
		this.applyBlockToTarget(targetCard as BaseCharacter);
		this.actionManager.applyBuffToCharacter(this.owner as BaseCharacter, new Blessed(1), this.owner as BaseCharacter);
		this.performActionOnRandomEnemy(enemy => {
			this.actionManager.applyBuffToCharacter(enemy, new Smoldering(this.getBaseMagicNumberAfterResourceScaling()), this.owner as BaseCharacter);
		});
	}
}