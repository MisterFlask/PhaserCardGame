## Game Concept Summary

### **Flavor Overview**

A roguelike deckbuilder set in an alternate-history 1890, where Hell has become a contested colonial frontier fought over by European imperialists, demon bureaucrats, and revolutionary movements. Picture a grimly humorous infernal landscape—part Victorian industrial nightmare, part colonial battleground, and part Kafkaesque bureaucracy.

The player runs **The East Infernal Company** from a London office, not as an adventurer but as its manager. You dispatch squads of hired soldiers through the Buckingham Rift to fulfil contracts: escort jobs, repossessions, punitive raids, favors for client factions. Along the way your soldiers fight corrupted wildlife in polluted swamps, undead Napoleonic infantry entrenched in frozen trenches, and the industrial-bureaucratic horrors of Dis, while European rivals (Germans field-testing artillery, British damming the Styx, Americans laying infernal railways) work the same territory for their own ends.

### **Gameplay and Mechanics**

* **Strategic layer: the contract board**

  * HQ presents a rotating board of contracts — each with a client, a deadline, a region, a difficulty, and a payout. Contracts expire; you cannot take them all.
  * The player assigns a squad of 3 from a persistent roster and dispatches them on a **sortie**: a short fixed sequence of combats (and the occasional event), not an open map. Full design in `strategic_layer_redesign.md`.
  * Soldiers are persistent company assets, not disposable run characters. They carry HP, XP, level, a personal deck, wounds, and stress from sortie to sortie. Wounded soldiers recover in the infirmary over game-weeks; death is permanent (barring specific mitigation). This XCOM-style scarcity — not a single run's survival — is what forces roster rotation and hard calls.
  * Card play within a sortie is tactical Slay-the-Spire-style deckbuilding: managing cards, energy, and combat resources (blood, venture, mettle, pluck, smog) that enable cross-class synergies. Energy is shared across the squad each turn.
  * Soldiers level up and are promoted at the sortie debrief, picking new cards for their personal deck and, at key levels, a class perk. A recruit starts with a basic kit; a veteran is a curated deck built up over many sorties.

* **Regions**

  1. **Styx Delta**: Swampy, industrially polluted wetlands — the Styx Boatman's Guild vs. the British damming project.
  2. **Deep France**: Frozen trenches where an undead Napoleonic empire, propped up by necromancy, fights the German Reichsinfernokorps.
  3. **The Dis Foundry Belt**: A bureaucratic-industrial capital run on paperwork and red tape, where the Stoker's Union faces off against the Brimstone Barons.

  See `worldbuilding.md` for the full regional and faction writeups.

* **The doom clock: quarterly dividends**

  * The Company's shareholders expect a dividend every quarter, paid from the vault in pounds sterling — the only currency in the game. Every pound not paid out can instead be reinvested in recruits, wages, healing, deck services, equipment, or strategic projects.
  * Miss or shortchange a dividend and shareholder satisfaction drops; run it to zero and the player is sacked — campaign over. Expectations escalate as the charter's ten years (forty quarters) run their course.
  * Between sorties, the player also commits to **strategic projects** (permanent Capital Works) and **standing orders** (swappable, slot-limited policies ratified at the quarterly board meeting) that reshape the contract board, the roster, or the sortie itself. Full detail in `strategic_layer_redesign.md`.

* **Consumable Equipment ("Field Kit")**

  * Expendable physical gear — tonics, demolition charges, surveyor's optics, phylacteries — providing temporary bonuses or battlefield effects.

### **Faction Dynamics**

* Multiple competing factions occupy Hell: imperialists, revolutionaries, various European continental powers, demonic capitalists, and demonic marxists. Every once in a while, an angel.
* The player does not take a starring role in these conflicts; they are the backdrop against which contracts, clients, and encounters are generated. See `worldbuilding.md` for factions and their representatives.

### **Visual & Narrative Style**

* Visual aesthetic mixes Victorian military regalia, Napoleonic uniforms, industrial machinery, and demonic surrealism. Each faction has unique, instantly recognizable color schemes and silhouettes.
* Dry corporate humor over Lovecraftian dread: bureaucratic absurdity and industrial horror played with a straight face, narrated via the field dispatches of the Company's field factor, Harry Cavendish (see `worldbuilding.md`).

---

### **Conclusion**

The goal is a sharply thematic XCOM-over-deckbuilder: strategic-layer tension between paying the dividend and building the Company, resolved sortie by sortie in tactical Slay-the-Spire combat, all narrated in a uniquely twisted alternate-history Hellscape.
