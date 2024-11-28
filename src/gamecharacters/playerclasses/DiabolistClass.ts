import ImageUtils from "../../utils/ImageUtils";
import { Gender } from "../BaseCharacter";
import { BaseCharacterClass } from "../BaseCharacterClass";
import { CharacterClasses } from "../CharacterClasses";
import { CursedStrike } from "./cards/diabolist/commons/CursedStrike";
import { DarkWhisper } from "./cards/diabolist/commons/DarkWhisper";
import { ObsidianCandles } from "./cards/diabolist/commons/ObsidianCandles";
import { Balefire } from "./cards/diabolist/rares/Balefire";
import { IllFatedBlade } from "./cards/diabolist/rares/CursedBlade";
import { HorrificRegeneration } from "./cards/diabolist/rares/HorrificRegeneration";
import { StrengthOfInsanity } from "./cards/diabolist/rares/StrengthOfInsanity";
import { BurningSight } from "./cards/diabolist/uncommon/BurningSight";
import { EldritchBlast } from "./cards/diabolist/uncommon/EldritchBlast";
import { SoulTrap } from "./cards/diabolist/uncommon/SoulTrap";
import { UnnaturalVigor } from "./cards/diabolist/uncommon/UnnaturalVigor";

export class DiabolistClass extends BaseCharacterClass {
    getPortraitNameAtRandom(gender: Gender): string {
        return ImageUtils.getRandomImageNameFromCategory(`portraits_diabolist_${gender === Gender.Female ? "female" : "male"}` as "portraits_diabolist_female");    
    }
    constructor() {
        super({ name: "Diabolist", id: CharacterClasses.DIABOLIST_ID, iconName: "diabolist_icon", startingMaxHp: 20 })
        this.cardBackgroundImageName = "diabolist_background"
        
        this.availableCards = [
            // common
            new Balefire(),
            new CursedStrike(),
            new DarkWhisper(),
            new ObsidianCandles(),
            
            // rare
            new Balefire(),
            new IllFatedBlade(),
            new HorrificRegeneration(),
            new StrengthOfInsanity(),

            //uncommon
            new BurningSight(),
            new EldritchBlast(),
            new SoulTrap(),
            new UnnaturalVigor()]

        
    }
}