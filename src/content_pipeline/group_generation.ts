


async function generateCharacters(outputFileName: string) {
  const OpenAI = require('openai');
  const fs = require('fs').promises;
  const path = require('path');
  const outputFilePath = path.join(__dirname, "content", outputFileName)
  
  // Initialize the OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY, // This should be set in your environment variables
  });
  
  const nouns = [
  "Doppelganger", "Dreamscape", "Dystopia", "Eclipse", "Effigy", "Eldritch", "Empathy", "Entropy", "Epiphany", "Equinox",
  "Ethereal", "Euphoria", "Exigence", "Expanse", "Fable", "Facet", "Fathom", "Fervor", "Fissure", "Flux",
  "Folly", "Fractal", "Frenzy", "Frontier", "Fulcrum", "Fusion", "Gaia", "Gambit", "Gestalt", "Glyph",
  "Gnosis", "Gossamer", "Harbinger", "Harmony", "Heresy", "Hieroglyph", "Hologram", "Hypnosis", "Ichor", "Ideology",
  "Ignition", "Illusion", "Imbroglio", "Impetus", "Inception", "Incursion", "Inertia", "Inferno", "Influx", "Innuendo",
  "Insight", "Instinct", "Interlude", "Juxtaposition", "Kaleidoscope", "Kismet", "Labyrinth", "Leviathan", "Limbo", "Locus",
  "Luminescence", "Maelstrom", "Magnum Opus", "Malaise", "Mandala", "Manifesto", "Mantra", "Masquerade", "Matriarch", "Mecca",
  "Melancholy", "Metamorphosis", "Miasma", "Microcosm", "Mirage", "Mnemonic", "Monolith", "Mosaic", "Muse", "Nadir",
  "Necropolis", "Nemesis", "Neoteny", "Nexus", "Nirvana", "Nostalgia", "Nova", "Novella", "Oasis", "Oblivion",
  "Obsidian", "Occult", "Odyssey", "Omen", "Oneiromancy", "Onus", "Opiate", "Oracle", "Oriflamme", "Ouroboros",
  "Panacea", "Pandemonium", "Paradigm", "Paradox", "Paragon", "Parallax", "Parasite", "Pariah", "Pathos", "Penance",
  "Penumbra", "Perigee", "Phantasm", "Phenomenon", "Pinnacle", "Pique", "Plasma", "Plethora", "Poignancy", "Poltergeist",
  "Precursor", "Premonition", "Primordial", "Prism", "Progeny", "Prometheus", "Purgatory", "Quagmire", "Quandary", "Quintessence",
  "Quixotic", "Reckoning", "Recursion", "Redemption", "Relic", "Rendezvous", "Requiem", "Resonance", "Reverie", "Rhapsody",
  "Rift", "Rune", "Sacrosanct", "Salvo", "Sanctum", "Satori", "Schism", "Scintilla", "Serendipity", "Serpentine",
  "Shibboleth", "Simulacrum", "Singularity", "Siren", "Soliloquy", "Solstice", "Somnolence", "Sophistry", "Spellbind", "Stasis",
  "Stigma", "Stratagem", "Strife", "Sublimate", "Subterfuge", "Supernova", "Symbiosis", "Synapse", "Synchronicity", "Synthesis",
  "Taboo", "Talisman", "Telemetry", "Tempest", "Tenebrous", "Terminus", "Tessellation", "Thalassic", "Theophany", "Threshold",
  "Torque", "Tranquility", "Transcendence", "Tribulation", "Triptych", "Umbra", "Unction", "Undertow", "Unison", "Utopia",
  "Vagary", "Valkyrie", "Vanquish", "Vehemence", "Veneration", "Veracity", "Vertigo", "Vestige", "Vex", "Vicissitude",
  "Visage", "Vortex", "Wander", "Wayward", "Whisper", "Wraith", "Xenith", "Yggdrasil", "Zeitgeist", "Zenith",
  "Apollo", "Artemis", "Athena", "Zeus", "Hera", "Poseidon", "Hades", "Demeter", "Ares", "Aphrodite",
  "Hermes", "Dionysus", "Hephaestus", "Hestia", "Persephone", "Hecate", "Nemesis", "Nike", "Iris", "Hypnos",
  "Thanatos", "Nyx", "Gaia", "Uranus", "Chronos", "Rhea", "Helios", "Selene", "Eos", "Aether",
  "Hemera", "Erebus", "Charon", "Styx", "Cerberus", "Hydra", "Medusa", "Minotaur", "Pegasus", "Chimera",
  "Phoenix", "Kraken", "Leviathan", "Basilisk", "Griffon", "Siren", "Harpy", "Centaur", "Cyclops", "Sphinx",
  "Odin", "Thor", "Loki", "Freya", "Baldur", "Heimdall", "Tyr", "Frigg", "Hel", "Fenrir",
  "Jormungandr", "Sleipnir", "Ratatoskr", "Huginn", "Muninn", "Valhalla", "Bifrost", "Mjolnir", "Gungnir", "Draupnir",
  "Ra", "Osiris", "Isis", "Horus", "Anubis", "Set", "Thoth", "Bastet", "Sekhmet", "Hathor",
  "Amun", "Ptah", "Nut", "Geb", "Nephthys", "Sobek", "Khonsu", "Taweret", "Wadjet", "Neith"
  ];


  
  const exampleResponse = {
    items: [
      {
        description: "They use cutting-edge neural implants to process vast amounts of information in real-time, and employ nano-drones for undetectable infiltration. Their signature weapon is a silent, EMP-resistant grappling hook for quick escapes.",
        theme: "Nexus",
        aesthetics: "Neon tattoos, skirts, black leather"
      },
      {
        description: "They utilize advanced optical camouflage suits that bend light around them, and employ sound-dampening technology in their boots. Their preferred method of elimination is a neurotoxin that mimics natural causes of death.",
        theme: "Phantom",
        aesthetics: "Black turtlenecks, cigarettes, very hipster"
      },
      {
        description: "They wield custom-built, quantum-encrypted devices capable of cracking any firewall within seconds. Their trademark is leaving behind a virtually undetectable virus that slowly corrupts data over time, making their intrusions nearly impossible to trace.",
        theme: "Cipher",
        aesthetics: "Green lights on all their clothing.  Very shiny gear."
      }
    ]
  }

  const n = 5;
  const randomWords = () => {
    const shuffled = [...nouns].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n).join(', ');
  };

  const prompt = `Please provide ${n} creative mercenary group ideas for a story set in a cyberpunk-style dystopia. Use these specific themes; ONE PER GROUP PLEASE: ${randomWords()}. Follow the structure of the example provided. Try to vary things up beyond standard cliches and tropes. Be AS CONCRETE AS POSSIBLE in your descriptions; specific weapons and tactics and technologies.`;
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You must respond with a JSON object matching this structure:" + JSON.stringify(exampleResponse) },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    // Ensure the directory exists
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
    
    // Write the result to the specified file
    await fs.writeFile(outputFilePath, JSON.stringify(result, null, 2));
    
    console.log(`Characters data written to ${outputFilePath}`);
    console.log('Tokens consumed in completion:', completion.usage.total_tokens);
    const costPerToken = 3.00/1_000_000; // Estimated cost per token in dollars
    const estimatedCost = completion.usage.total_tokens * costPerToken;
    console.log('Estimated cost of API call: $', estimatedCost.toFixed(5));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function with the default output path
generateCharacters("groups_v1.json");