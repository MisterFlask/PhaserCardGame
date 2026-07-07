import { PlayerCharacter } from "../PlayerCharacter";
import { CARGO_FLAVOR_NAMES, TradeGoodsCargo } from "./TradeGoodsCargo";

/**
 * Sortie-scoped cargo injection/strip for Trade Run contracts (see
 * src/docs/trade_run_design.md). Lives under gamecharacters/cargo/ so the
 * `cardsInMasterDeck.push` calls stay inside the SaveRegistriesLint's cargo
 * exemption (see SaveRegistriesLint.test.ts: "vessel cargo isn't saved
 * (v1)") — cargo cards can never persist to a save because they are always
 * stripped before the sortie hands control back to HQ (resolveSortie /
 * handleSquadWipe), so no SaveRegistries entry is ever needed for
 * TradeGoodsCargo. If that invariant is ever broken (cargo left on a
 * roster deck across a save), this comment is the tripwire: add the class
 * to SaveRegistries AND remove it from the lint's cargo exemption.
 *
 * Injection is round-robin across the deployed squad, 2 cards per crate
 * (spec: "Each crate loads 2 cargo cards into the squad's combat decks for
 * the sortie, distributed round-robin across soldiers").
 */

const CARDS_PER_CRATE = 2;

/** Pushes `cratesLoaded * 2` cargo cards round-robin onto the deployed
 *  squad's master decks. Call once, at dispatch, after the squad is set. */
export function injectCargoIntoSquad(squad: PlayerCharacter[], cratesLoaded: number): void {
    if (cratesLoaded <= 0 || squad.length === 0) return;
    const cardCount = cratesLoaded * CARDS_PER_CRATE;
    for (let i = 0; i < cardCount; i++) {
        const soldier = squad[i % squad.length];
        const flavorName = CARGO_FLAVOR_NAMES[i % CARGO_FLAVOR_NAMES.length];
        const card = new TradeGoodsCargo(flavorName);
        card.owningCharacter = soldier;
        soldier.cardsInMasterDeck.push(card);
    }
}

/** Strips every cargo card back out of the squad's master decks. Call on
 *  every sortie exit path (resolution AND squad wipe) — cargo must never
 *  survive to the next sortie or to a save. */
export function stripCargoFromSquad(squad: PlayerCharacter[]): void {
    squad.forEach(soldier => {
        soldier.cardsInMasterDeck = soldier.cardsInMasterDeck.filter(c => !(c instanceof TradeGoodsCargo));
    });
}
