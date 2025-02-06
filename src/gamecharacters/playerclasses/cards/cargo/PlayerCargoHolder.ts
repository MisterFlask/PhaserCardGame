import { Gender } from "../../../BaseCharacter";
import { BaseCharacterClass } from "../../../BaseCharacterClass";
import { PlayableCard } from "../../../PlayableCard";
import { PlayerCharacter } from "../../../PlayerCharacter";

class DummyCharacterClass extends BaseCharacterClass {
    constructor() {
        super({
            name: "Dummy Character",
            iconName: "placeholder_character_background_1",
            startingMaxHp: 100,
            id: "dummy_character_class"
        });
    }

    getPortraitNameAtRandom(gender: Gender): string {
        return "placeholder_character_background_1";
    }
}


export class PlayerCargoHolder extends PlayerCharacter {
    constructor() { 
        super({
            name: "Cargo Holder",
            description: "A dummy character used to hold cargo.",

            portraitName: "placeholder_character_background_1",
            characterClass: new DummyCharacterClass(), //doesn't actually matter here
        });
    }

    public purgeAllCargo(){
        this.cardsInMasterDeck = [];
    }

    public addCargoCard(card: PlayableCard){
        this.cardsInMasterDeck.push(card);
    }
    public removeRandomCargoCards(num: number){
        if (num <= 0 || this.cardsInMasterDeck.length === 0) return;
        
        // Ensure we don't try to remove more cards than exist
        const cardsToRemove = Math.min(num, this.cardsInMasterDeck.length);
        
        for (let i = 0; i < cardsToRemove; i++){
            // Get random index
            const randomIndex = Math.floor(Math.random() * this.cardsInMasterDeck.length);
            // Remove card at random index
            this.cardsInMasterDeck.splice(randomIndex, 1);
        }
    }
}

