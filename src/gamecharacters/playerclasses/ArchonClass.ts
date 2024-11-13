import ImageUtils from "../../utils/ImageUtils";
import { Gender } from "../BaseCharacter";
import { BaseCharacterClass } from "../CharacterClasses";
import { Bolster } from "./cards/archon/commons/Bolster";
import { Buzzsword } from "./cards/archon/commons/Buzzsword";
import { HandCannon } from "./cards/archon/commons/HandCannon";
import { Incoming } from "./cards/archon/commons/Incoming";
import { InspiringPresence } from "./cards/archon/commons/InspiringPresence";
import { TacticalManual } from "./cards/archon/commons/TacticalManual";
import { TheLash } from "./cards/archon/commons/TheLash";
import { ChainOfCommand } from "./cards/archon/rare/ChainOfCommand";
import { GloriousSacrifice } from "./cards/archon/rare/GloriousSacrifice";
import { IronWill } from "./cards/archon/rare/IronWill";
import { LastBastion } from "./cards/archon/rare/LastBastion";
import { Quartermaster } from "./cards/archon/rare/Quartermaster";
import { QueensMandate } from "./cards/archon/rare/QueensMandate";
import { CourageUnderFire } from "./cards/archon/uncommon/CourageUnderFire";
import { InspireFear } from "./cards/archon/uncommon/InspireFear";
import { Orders } from "./cards/archon/uncommon/Orders";
import { TheLaw } from "./cards/archon/uncommon/TheLaw";
import { ToughItOut } from "./cards/archon/uncommon/ToughItOut";

export class ArchonClass extends BaseCharacterClass {
    getPortraitNameAtRandom(gender: Gender): string {
        return ImageUtils.getRandomImageNameFromCategory(`portraits_archon_${gender === Gender.Female ? "female" : "male"}` as "portraits_archon_female");
    }

    constructor() {
        super({ name: "Archon", iconName: "archon_icon", startingMaxHp: 30 })
        // Add Archon-specific cards here
        this.cardBackgroundImageName = "archon_background"
        this.availableCards = [
            // common
            new Bolster(),
            new Buzzsword(),
            new HandCannon(),
            new Incoming(),
            new InspiringPresence(),
            new TacticalManual(),
            new TheLash(),

            // uncommon
            new CourageUnderFire(),
            new InspireFear(),
            new Orders(),
            new TheLaw(),
            new ToughItOut(),

            // rare
            new ChainOfCommand(),
            new GloriousSacrifice(),
            new LastBastion(),
            new IronWill(),
            new Quartermaster(),
            new QueensMandate()
        ]
    }
}