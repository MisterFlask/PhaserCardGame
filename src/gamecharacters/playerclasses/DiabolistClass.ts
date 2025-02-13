import ImageUtils from "../../utils/ImageUtils";
import { Gender } from "../BaseCharacter";
import { BaseCharacterClass } from "../BaseCharacterClass";
import { CharacterClasses } from "../CharacterClasses";
import { BloodShield } from "./cards/diabolist/commons/BloodShield";
import { CursedStrike } from "./cards/diabolist/commons/CursedStrike";
import { DarkWhisper } from "./cards/diabolist/commons/DarkWhisper";
import { ObsidianCandles } from "./cards/diabolist/commons/ObsidianCandles";
import { Balefire } from "./cards/diabolist/rares/Balefire";
import { ExpertOccultist } from "./cards/diabolist/rares/ExpertOccultist";
import { Hemomancer } from "./cards/diabolist/rares/Hemomancer";
import { HorrificRegeneration } from "./cards/diabolist/rares/HorrificRegeneration";
import { IllFatedBlade } from "./cards/diabolist/rares/IllFatedBlade";
import { Soulsuck } from "./cards/diabolist/rares/Soulsuck";
import { BurningSight } from "./cards/diabolist/uncommon/BurningSight";
import { EldritchBlast } from "./cards/diabolist/uncommon/EldritchBlast";
import { Shadowflame } from "./cards/diabolist/uncommon/Shadowflame";
import { SorcerousDisplay } from "./cards/diabolist/uncommon/SorcerousDisplay";
import { UnnaturalVigor } from "./cards/diabolist/uncommon/UnnaturalVigor";

export class DiabolistClass extends BaseCharacterClass {
    getPortraitNameAtRandom(gender: Gender): string {
        return ImageUtils.getRandomImageNameFromCategory(`portraits_diabolist_${gender === Gender.Female ? "female" : "male"}` as "portraits_diabolist_female");    
    }
    constructor() {
        super({ name: "Diabolist", id: CharacterClasses.DIABOLIST_ID, iconName: "diabolist_icon", startingMaxHp: 20 })
        this.cardBackgroundImageName = "diabolist_background"
        this.longDescription = "Experts in the occult, Diabolists have embraced the strange powers that occur in roughly 16.66% of recruits who cross through to other realities via Maxwell-Babbage Ontology Tunnels."
        this.availableCards = [
            // common
            new CursedStrike(),
            new DarkWhisper(),
            new ObsidianCandles(),
            new BloodShield(),
            
            // uncommon
            new BurningSight(),
            new EldritchBlast(),
            new Shadowflame(),
            new SorcerousDisplay(),
            new UnnaturalVigor(),

            // rare
            new Balefire(),
            new ExpertOccultist(),
            new Hemomancer(),
            new HorrificRegeneration(),
            new IllFatedBlade(),
            new Soulsuck()
        ]
    }
}