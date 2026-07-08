export default class ImageUtils {
    // Nested object containing categories with file prefix and an array of image filenames
    public static readonly images = {
        map_backgrounds: {
            prefix: 'Sprites/MapBackgrounds/',
            files: [
                'bw_hell_bazaar.png',
                'campfire_1.png',
                'hell_blur_1.png',
                'ironlordbyron_a_fantasy_map_of_Hell_879ffbb3-754f-4c86-9688-adc2dff6495e.png',
                'ironlordbyron_a_grand_but_blighted_landscape_of_Hell_abstract_a_1848e563-4e0f-4305-bb30-2157d516128d.png'
            ]
        },
        backgrounds: {
            prefix: 'Backgrounds/',
            files: ['greyscale.png', 'mapbackground1.png', 'contract-map-hell.png'
            ]
        },
        location_backgrounds: {
            prefix: 'Backgrounds/Location/',
            files: [
                // battle backgrounds
                "backrooms-oil-painting.png",
                "canyon-oil-painting.png",
                "facility-oil-painting.png",
                "forest-oil-painting.png",
                "heaven-oil-painting.png",
                "hell-oil-painting-cold.png",
                "hell-oil-painting-dimmer.png",
                "hell-oil-painting-foundry.png",
                "hell-oil-painting.png",
                "ruined-city-oil-painting.png",
                "shop-background-1-original.png",
                "shop-background-1.png",
                "shop-background-oil-painting.png",
                "green-facility-oil-painting.png",
                "eldritch-jungle-oil-painting.png",
                "planar-gate-oil-painting-1.png",
                "planar-gate-oil-painting-2.png",
                "british-office-1.png",
                "investments-screen-oil-painting.png",

                "swamp-1.png",
                "swamp-2.png",
                "swamp-3.png",

                // act-4 art batch 4: Brimstone Badlands combat backgrounds (July 2026)
                "brimstone-badlands-oil-painting-1.png",
                "brimstone-badlands-oil-painting-2.png",
              ]
        },
        portraits_npcs: {
            prefix: 'Portraits/NpcPortraits/',
            files: [
                "shopkeeper-professional.png",
                "shopkeeper-shady.png",
                "shopkeeper-spooky.png",
              ]
        },
        steamers:{
            prefix: 'Portraits/BoatPortraits/',
            files: [
                "amphibious_steamer.png",
            ]
        },
        portraits_blackhand_female: {
            prefix: 'Portraits/BlackhandPortraits/female/',
            files: [
                "blackhand_female_1.png",
                "blackhand_female_2.png",
              ]
        },
        portraits_diabolist_female: {
            prefix: 'Portraits/DiabolistPortraits/female/',
            files: [
                "diabolist_female_1.png",
                "diabolist_female_2.png",
                "diabolist_female_3.png",
                "diabolist_female_4.png",
              ]
        },
        portraits_archon_female: {
            prefix: 'Portraits/ArchonPortraits/female/',
            files: [
                "archon_female_1.png",
                "archon_female_2.png",
                "archon_female_3.png",
              ]
        },
        portraits_cog_female: {
            prefix: 'Portraits/CogPortraits/female/',
            files: [
                "cog_female_1.png",
                "cog_female_2.png",
                "cog_female_3.png",
              ]
        },
        ui: {
            prefix: 'UI/',
            files: ['drawpile.png', 'discardpile.png', 'placeholder.png', 'oops_image.webp', 'select.png', 'square.png', 'red_background.png']
        },
        card_backgrounds: {
            prefix: 'Sprites/CardBackgrounds/',
            files: ['archon_background.png', 'blackhand_background.png', 'diabolist_background.png', 'cog_background.png', 'scavenger_background.png', 'hammer_background.png']
        },
        cards_blackhand: {
            prefix: 'Sprites/Cards/Blackhand/',
            files: [
                'abstract-002.png', 'abstract-042.png', 'baby-face.png', 'balloon-dog.png', 'barrel-leak.png',
                'bear-head.png', 'bottle-vapors.png', 'chemical-tank.png', 'cigar.png', 'confrontation.png',
                'defensive-wall.png', 'dog-house.png', 'enrage-card-art.png', 'fire-axe.png', 'fire-ray.png',
                'fire-zone.png', 'fire.png', 'fireball.png', 'fireflake.png', 'firewall.png',
                'flame.png', 'flamethrower-soldier.png', 'flaming-trident.png', 'flash-grenade.png',
                'gorilla.png', 'grenade-a.png', 'half-dead.png', 'hidden.png', 'power-generator.png',
                'radial-balance.png',  'screaming.png', 'smog-grenade.png',
                'stone-wall.png', 'tv.png', 'vacuum-cleaner.png', 'white-book.png'
            ]
        },
        cards_status:{
            prefix: 'Sprites/Cards/StatusCards/',
            files: [
                'stinging-insects.png',
            ]
        },
        cards_cursed_cargo:{
            prefix: 'Sprites/Cards/CursedCargo/',
            files: [
                'cursed_cargo_1.png',
                'cursed_cargo_2.png',
                'cursed_cargo_3.png',
                'cursed_cargo_4.png',
                'cursed_cargo_5.png',
                'cursed_cargo_6.png',
                'cursed_cargo_7.png',
                'cursed_cargo_8.png',
            ]
        },
        abstract_placeholders: {
            prefix: 'Sprites/Placeholders/',
            files: [
                "abstract-001.png",
                "abstract-002-alt.png",
                "abstract-003.png",
                "abstract-004.png",
                "abstract-005.png",
                "abstract-006.png",
                "abstract-007.png",
                "abstract-008.png",
                "abstract-009.png",
                "abstract-010.png",
                "abstract-011.png",
                "abstract-012.png",
                "abstract-013.png",
                "abstract-014.png",
                "abstract-015.png",
                "abstract-016.png",
                "abstract-017.png",
                "abstract-018.png",
                "abstract-019.png",
                "abstract-020.png",
                "abstract-021.png",
                "abstract-022.png",
                "abstract-023.png",
                "abstract-024-alt.png",
                "abstract-025-alt.png",
                "abstract-026.png",
                "abstract-027.png",
                "abstract-028.png",
                "abstract-029.png",
                "abstract-030.png",
                "abstract-031.png",
                "abstract-032.png",
                "abstract-033.png",
                "abstract-034.png",
                "abstract-035.png",
                "abstract-036.png",
                "abstract-037.png",
                "abstract-038.png",
                "abstract-039.png",
                "abstract-040.png",
                "abstract-041.png",
                "abstract-042-alt.png",
                "abstract-043.png",
                "abstract-044.png",
                "abstract-045.png",
                "abstract-046.png",
                "abstract-047.png",
                "abstract-048.png",
                "abstract-049.png",
                "abstract-050.png",
                "abstract-051.png",
                "abstract-052.png",
                "abstract-053.png",
                "abstract-054.png",
                "abstract-055.png",
                "abstract-056.png",
                "abstract-057.png",
                "abstract-058.png",
                "abstract-059.png",
                "abstract-060.png",
                "abstract-061.png",
                "abstract-062.png",
                "abstract-063.png",
                "abstract-064.png",
                "abstract-065.png",
                "abstract-066.png",
                "abstract-067.png",
                "abstract-068.png",
                "abstract-069.png",
                "abstract-070.png",
                "abstract-071.png",
                "abstract-072.png",
                "abstract-073.png",
                "abstract-074.png",
                "abstract-075.png",
                "abstract-076.png",
                "abstract-077.png",
                "abstract-078.png",
                "abstract-079.png",
                "abstract-080.png",
                "abstract-081.png",
                "abstract-082.png",
                "abstract-083.png",
                "abstract-084.png",
                "abstract-085-alt.png",
                "abstract-086.png",
                "abstract-087.png",
                "abstract-088.png",
                "abstract-089.png",
                "abstract-090.png",
                "abstract-091.png",
                "abstract-092.png",
                "abstract-093.png",
                "abstract-094.png",
                "abstract-095.png",
                "abstract-096.png",
                "abstract-097.png",
                "abstract-098.png",
                "abstract-099.png",
                "abstract-100.png",
                "abstract-101.png",
                "abstract-102.png",
                "abstract-103.png",
                "abstract-104.png",
                "abstract-105.png",
                "abstract-106.png",
                "abstract-107.png",
                "abstract-108.png",
                "abstract-109.png",
                "abstract-110.png",
                "abstract-111.png",
                "abstract-112.png",
                "abstract-113.png",
                "abstract-114.png",
                "abstract-115.png",
                "abstract-116.png",
                "abstract-117.png",
                "abstract-118.png",
                "abstract-119.png",
                "abstract-120.png",
                "abstract-121.png"
            ]
            
        },
        cards_diabolist: {
            prefix: 'Sprites/Cards/Diabolist/',
            files: [
                'ants.png', 'armor-upgrade.png', 'attached-shield.png', 'burning-skull.png',
                'cobra.png', 'daemon-skull.png', 'despair-card-art.png', 'disintegrate (1).png',
                'disintegrate.png', 'dread-card-art.png', 'eye-shield.png', 'fire-gem.png',
                'gem-pendant.png', 'gunshot.png', 'horned-skull.png', 'jason-mask.png',
                'lit-candelabra.png', 'maggot.png', 'pentacle.png', 'pentagram-rose.png',
                'praying-mantis.png', 'reaper-scythe.png', 'shield-bounces.png', 'shield-reflect.png',
                'skull-bolt.png', 'skull-staff.png', 'spade-skull.png', 'spider-eye.png',
                'spider-face.png', 'templar-shield.png', 'terror.png', 'wasp-sting.png'
            ]
        },
        cards_cog: {
            prefix: 'Sprites/Cards/Cog/',
            files: [
                'assembly-line-card-art.png', 'depreciation-schedule-card-art.png',
                'patent-infringement-card-art.png', 'production-quota-card-art.png',
                'rivet-card-art.png', 'stamp-press-card-art.png', 'warranty-clause-card-art.png'
            ]
        },
        maps: {
            prefix: 'Backgrounds/Act/',
            files: ['styx_delta.png', "dis.png", "caves.png", "jungle.png", "city.png"]
        },
        placeholder_backgrounds: {
            prefix: 'Backgrounds/Placeholder/',
            files: ['placeholder_event_background_1.png', "placeholder_event_background_2.png"]
        },
        enemies_v3:{
            prefix: 'Sprites/Enemies/v3/',
            files:[
                "aristocrat_1.png",
                "aristocrat_2.png",
                "brigand_symbol_2.png",
                "brigand_symbol.png",
                "capitalist_1.png",
                "capitalist_2.png",
                "censored_wisp_swarm.png",
                "coal_golem.png",
                "environmentalist_1.png",
                "green_wisp_swarm_2.png",
                "orange_wisp_swarm.png",
                "orange_wisp.png",
                "shopkeeper_shady_symbol.png",
                "shopkeeper_spicy_symbol.png",
                "sigil_bird.png",
                "symbol_head_charon.png",
                "symbol_hydra.png",
                "wisp_censored.png",
                "wood_golem.png",
                "moose.png",
                "totem_1.png",

                // act-1 art burndown batch 1 (July 2026)
                "hermit.png", "ferryman_mutineer.png", "totem_2.png",
                "ghost_ship.png", "fare_enforcer.png", "treasure.png",

                // act-2 art burndown batch 2 (July 2026)
                "frost_knight.png",

                // act-3 art burndown batch 3 (July 2026)
                "overseer.png", "foreman.png", "robot-minion.png", "fiery-orator.png",
                "tough-worker.png", "angry-worker.png", "manager-demon.png", "angry-worker-boss.png",

                // act-4 art batch 4: Brimstone Badlands enemy portraits (July 2026)
                "vent-tick.png", "slag-porter.png", "choir-novice.png", "bell-warden.png",
                "brimstone-prospector.png", "interdicted-hauler.png", "choir-cantor.png",
                "foundry-seraph.png", "barons-assessor.png", "caldera-shambler.png", "the-ninth-bell.png"
              ]
        },
        enemies: {
            prefix: 'Sprites/Enemies/v2/',
            files: [
                'Blood Manipulation Mage.png', 'Blood Manipulation Slime.png', 'Boss Clockwork Queen.png',
                'Boss Corrupted God Nyarlathotep.png', 'Boss Corruption Originator Azathoth.png',
                'Boss Dragon Knight Slime.png', 'Boss Dryad Yggdrasil.png', 'Boss Eldritch Slime Overmind.png',
                'Boss Ella, Sovereign Of Darkness.png', 'Boss Flying Devourer.png',
                'Boss Grand Sorceress Duessa.png', 'Boss Khronos.png', 'Boss Life Reaper.png',
                'Boss RADIANCE Eldritch Knight.png', 'Boss Shield Knightess.png', 'Boss Slime Girl Empress.png',
                'Boss Train Mech Enjin.png', 'Boss Zero Machina.png', 'Boss Zodiac Virgo.png',
                'Breakfast Nightmares Bacon Beast.png', 'Breakfast Nightmares Bread Loaf.png',
                'Breakfast Nightmares Egg Slime.png', 'Clockwork Abomination.png', 'Clockwork Iron Maiden.png',
                'Clockwork Mini A.png', 'Clockwork Queen.png', 'Clockwork Seer.png', 'Clockwork Skull.png',
                'Clockwork Slime.png', 'Clockwork Spider Mini.png', 'Clockwork Spider.png',
                'Corrupted Fire Dragon.png', 'Corrupted Legendary Knight Arriette.png',
                'Corrupted Legendary Knight Sen.png', 'Corrupted Spider.png', 'Demon Critter Squirrel.png',
                'Dryads Mage.png', 'Eldritch Corruption Obelisk.png', 'Eldritch Corruption Treant.png',
                'Golems Eye Golem.png', 'Hero Magic Knightess.png', 'Slime Darkii.png', 'Slime Fireii.png',
                'Slime Iceii.png', 'Slime RPG Basic.png', 'Boss Harbinger.png', 'Torture Device Iron Maiden A.png',
                'Light Creatures Throne.png', "Light Wisp.png", "Mirror Mimic.png", "Obelisk of Pentacles.png", "swarm_bugs_placeholder.png", "Weird Mirror.png", "Arcane Crystal.png",
                'Darkness Wisp.png', 'Light Gemstone A.png',

                // french
                "Eldritch Corruption Deer.png", "Eldritch Soldier Gunner.png", "Eldritch Corruption Crow.png",

                "veil-capacitor.png", "doris-smith.png", "sorrowmoth-swarm.png",
                "Worm.png", "Lumberjack.png", 
                
                // symbol heads
                "symbol_worm.png", "symbol_tick.png", "symbol_deer.png", "symbol_brigand.png", "symbol_bird.png",

                // replacements for mismatched stock-art portraits (July 2026)
                "artiste-slime-painter.png", "brine-bast-meat-beast.png", "french-policeman-gendarme.png",
                "french-restauranteur-chef.png", "grafter-trench-medic.png", "hive-broodmother-louse.png",
                "lexiophage-bureaucrat.png",

                // act-1 art burndown batch 1 (July 2026)
                "Horror Worm.png", "Salamander.png", "Drowned Sailor.png", "Corrupted Bird.png",
                "Electric Eel.png", "Pirate.png", "Ooze.png", "Lost Accountant.png",

                // act-2 art burndown batch 2 (July 2026)
                "Napoleonic Zombie.png", "Bureaucratic Beast.png", "Machine Gunner Demon.png"
            ]
        },
        attributes_and_augments: {
            prefix: 'Sprites/AttributesAndAugments/',
            files: [
                "sale_tag.png",
                'abdominal-armor.png', 'abstract-024.png', 'abstract-025.png', 'abstract-085.png',
                'achilles-heel.png', 'acrobatic.png', 'angry-eyes.png', 'armor-punch.png',
                'barricade.png', 'bleeding-wound.png', 'body-balance.png', 'bottom-right-3d-arrow.png',
                'brass-eye.png', 'breaking-chain.png', 'broken-axe.png', 'buffalo-head.png',
                'burning-forest.png', 'car-battery.png', 'clockwork.png', 'dead-wood.png',
                'despair.png', 'dread.png', 'enrage.png', 'eyeball.png', 'forward-sun.png',
                'gears.png', 'gems.png', 'gold-bar.png', 'gooey-eyed-sun.png', 'imp-laugh.png',
                'king.png', 'lamprey-mouth.png', 'matchbox.png', 'metal-scales.png', 'pocket-watch.png',
                'prayer.png', 'public-speaker.png', 'rear-aura.png', 'run.png', 'rusty-sword.png',
                'sea-turtle.png', 'shattered-heart.png', 'smart.png', 'spiked-tentacle.png',
                'sticky-boot.png', 'surprised-skull.png', 'unbalanced.png', 'weight-lifting-up.png', 'pizza-slice.png',
                'card-draw-minus.png', 'do-not-look.png', 'heavy.png', 'self-destruct.png',
                'egg-clutch.png', 'regeneration.png', 'giant.png', 'spiky-wing.png', 'duel.png', 'fencer.png',

                // icon art batch 5: buff icons (July 2026)
                'bureaucrat.png', 'f.png', 'syringe.png', 'snowflake.png', 'scroll.png', 'decay.png',
                'ear-worm.png', 'spear.png', 'greed.png', 'leech.png', 'minion.png', 'factory.png'
            ]
        },
        map_icons: {
            prefix: 'Sprites/MapIcons/',
            files: [
                "old-wagon.png",
                'boss-icon.png', 'elite-icon.png', 'entrance-icon.png', 'event-icon.png', 'rest-icon.png', 'shop-icon.png', 'room-fight-icon.png', 'treasure-icon.png'
            ]
        },
        combat_resources: {
            prefix: 'Sprites/CombatResources/',
            files: ['powder_icon.png', 'iron_icon.png', 'papers_icon.png', 'feather_icon.png', 'venture_icon.png', 'smog_icon.png', 'ashes_icon.png', 'blood_icon.png']
        },
        mission_icons: {
            prefix: 'Sprites/MissionIcons/',
            files: ['cash.png', 'fairy.png', 'gate.png', 'key.png', 'relic.png', 'strategic.png']
        },
        mission_terrain: {
            prefix: 'Sprites/MissionTerrain/',
            files: ['forest.png', 'grass.png', 'modern-city.png', 'mountains.png']
        },
        other_icons: {
            prefix: 'Sprites/OtherIcons/',
            files: ['checked-shield (1).png', 'rolling-energy.png']
        },
        ui_elements: {
            prefix: 'Sprites/UIElements/',
            files: ['Circle.png', 'cheap_glow_effect.png', 'play-button.png']
        },
        relics: {
            prefix: 'Sprites/Relics/',
            files: [
                'torn-page.png', 'vial-of-blood.png', 'bottle-of-mist.png', 'nightshard.png',
                'marksmans-manual.png', 'marrow-spike.png', 'iron-filings.png', 'machine-effigy.png',
                'frozen-dew.png', 'glass-cross.png',
                'sentient-smoke.png', 'slaughterbots-figurine.png', 'soul-bottler.png',
                'stovepipe-hat.png', 'hemomancy-tome.png', 'shatterkiss.png', 'belphegors-rounds.png',
                'boneflood.png', 'echo-harvest.png',
                'emergency-teleporter.png', 'ecclesiastical-recommendation.png',
                'dainty-gloves.png', 'fancy-hat.png', 'burning-antlers.png', 'charons-price.png',
                'basic-energy-relic.png',
                'whisper-of-sorrow.png', 'wraith-in-a-bottle.png', 'oubliette-flower.png',
                'screaming-parasite.png', 'sonorous-klaxon.png', 'devouring-icon.png',
                'greedy-parasite.png', 'bloom-of-sorrow.png', 'bomber-gremlin.png',
                'akashic-newspaper.png', 'bloodvine.png'
            ]
        },
        relics_esteem: {
            prefix: 'Sprites/Relics/Esteem/',
            files: [
                'stokers-union-crest.png', 'artisanal-guilds-crest.png', 'brimstone-barons-crest.png',
                'cinder-court-crest.png', 'invasion-cult-crest.png'
            ]
        },
        intent_icons: {
            prefix: 'Sprites/IntentIcons/',
            files: [
                'knife-thrust.png', 'magick-trick.png', 'poison-bottle-2.png', 'round-shield.png',
                'star-swirl.png', 'uncertainty.png', 'unstable-orb.png', 'sword-array.png',
                // pentacle-intent avoids a key collision with the diabolist
                // card pentacle icon (keys are filenames sans extension).
                'chemical-bolt.png', 'add-card-to-pile.png', 'pentacle-intent.png',

                // icon art batch 5: intent icons (July 2026)
                'card-plus.png', 'tag.png', 'running-ninja.png', 'heal.png', 'grenade.png',
                'card-burn.png', 'hazard.png', 'fire-breath.png'
            ]
        },
    };

    // Served relative to the page: works for local dev (http-server at repo root)
    // and gh-pages (deploy merges master, so resources/ sits beside index.html).
    private readonly baseURL: string = 'resources/';

    /**
     * Loads all images from all categories into the Phaser loader.
     * The key is automatically derived from the filename by stripping the `.png` extension.
     * @param loader - The Phaser loader object.
     */
    public loadAllImages(loader: Phaser.Loader.LoaderPlugin): void {
        console.log('Starting to load all images...');
        
        // Add error event listener
        loader.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: any) => {
            console.error(`Failed to load asset: ${file.key} from ${file.url || file.src}`);
        });
        
        // Add completion listener
        loader.on(Phaser.Loader.Events.COMPLETE, () => {
            console.log('All assets finished loading.');
        });

        loader.on(Phaser.Loader.Events.FILE_LOAD, (file: any) => {
            console.log(`Loaded asset: ${file.key} from ${file.url || file.src}`);
        });
        
        for (const category in ImageUtils.images) {
            const categoryData = ImageUtils.images[category as keyof typeof ImageUtils.images];
            console.log(`Loading category: ${category}, count of assets: ${categoryData.files.length}`);
            
            categoryData.files.forEach((file: string) => {
                const key = file.replace(/\.(png)$/, '');
                const fullUrl = `${this.baseURL}${categoryData.prefix}${file}`;
                
                console.log(`Attempting to load [${key}] from: ${fullUrl}`);
                
                loader.image({
                    key: key,
                    url: fullUrl
                });
            });
        }
    }

    /**
     * Gets a deterministic image name from the abstract_placeholders category based on a provided key.
     * @param key - The string key to use for deterministic selection.
     * @returns The name of the selected image without the file extension.
     */
    public static getDeterministicAbstractPlaceholder(key: string): string {
        const placeholders = this.images.abstract_placeholders.files;
        const hash = this.hashString(key);
        const index = hash % placeholders.length;
        return placeholders[index].replace(/\.(png|svg)$/, '');
    }

    /**
     * Simple hash function to convert a string to a number.
     * @param str - The string to hash.
     * @returns A number hash of the input string.
     */
    private static hashString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    public static getRandomImageNameFromCategory(category: keyof typeof this.images): string {
        const categoryData = this.images[category];
        const randomIndex = Math.floor(Math.random() * categoryData.files.length);
        
        const randomFile = categoryData.files[randomIndex];
        
        return randomFile.replace(/\.(png|svg)$/, '');
    }
}
