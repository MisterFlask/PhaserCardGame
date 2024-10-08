import { TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { Smoldering } from "../../../buffs/blackhand/Smoldering";
import { ExhaustBuff } from "../../../buffs/playable_card/ExhaustBuff";
import { PlayableCard } from "../../../PlayableCard";

export class Smokescreen extends PlayableCard {
	constructor() {
		super({
			name: "Smokescreen",
			description: `_`,
			portraitName: "smoke-bomb",
			targetingType: TargetingType.NO_TARGETING,
		});
		this.baseMagicNumber = 3;
		this.baseBlock = 5;
		this.energyCost = 1;
		this.buffs.push(new ExhaustBuff());
	}

	override get description(): string {
		return `Apply ${this.getDisplayedMagicNumber()} Smoldering to ALL enemies. All party members gain ${this.getDisplayedBlock()} Block. Exhaust.`;
	}
	
	override InvokeCardEffects(): void {
		this.forEachEnemy(enemy => {
			this.actionManager.applyBuffToCharacter(enemy as BaseCharacter, new Smoldering(this.getBaseMagicNumberAfterResourceScaling()), this.owner as BaseCharacter);
		});

		this.forEachAlly(ally => {
			this.applyBlockToTarget(ally);
		});
	}
}