export default class GameImageLoader {
    // Nested object containing categories with file prefix and an array of image filenames
    private static readonly images = {
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
            files: ['greyscale.png', 'mapbackground1.png', 'vintage_brown.png', 'battleback1.png'
            ]
        },
        location_backgrounds: {
            prefix: 'Backgrounds/Location/',
            files: ['forest-battle-background-1.png',
                'shop-background-1.png',
            ]
        },
        portraits_blackhand_female: {
            prefix: 'Portraits/BlackhandPortraits/female/',
            files: [
                "blackhand_female_1.png",
                "blackhand_female_2.png",
                "blackhand_female_3.png",
                "blackhand_female_4.png",
                "blackhand_female_5.png",
                "blackhand_female_6.png"
              ]
        },
        portraits_diabolist_female: {
            prefix: 'Portraits/DiabolistPortraits/female/',
            files: [
                "diabolist_female_1.png",
                "diabolist_female_2.png",
                "diabolist_female_3.png",
                "diabolist_female_4.png"
              ]
        },
        portraits_archon_female: {
            prefix: 'Portraits/ArchonPortraits/female/',
            files: [
                "archon_female_1.png",
                "archon_female_2.png",
                "archon_female_3.png",
                "archon_female_4.png",
                "archon_female_5.png"
              ]
        },
        ui: {
            prefix: 'UI/',
            files: ['drawpile.svg', 'discardpile.svg', 'placeholder.png', 'oops_image.webp']
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
                'defensive-wall.png', 'dog-house.png', 'enrage.png', 'fire-axe.png', 'fire-ray.png',
                'fire-zone.png', 'fire.png', 'fireball.png', 'fireflake.png', 'firewall.png',
                'flame.png', 'flamethrower-soldier.png', 'flaming-trident.png', 'flash-grenade.png',
                'gorilla.png', 'grenade-a.png', 'half-dead.png', 'hidden.png', 'power-generator.png',
                'radial-balance.png', 'regeneration.png', 'screaming.png', 'smog-grenade.png',
                'stone-wall.png', 'tv.png', 'vacuum-cleaner.png', 'white-book.png'
            ]
        },
        abstract_placeholders: {
            prefix: 'Sprites/Placeholders/',
            files: [
                "abstract-001.svg",
                "abstract-002.svg",
                "abstract-003.svg",
                "abstract-004.svg",
                "abstract-005.svg",
                "abstract-006.svg",
                "abstract-007.svg",
                "abstract-008.svg",
                "abstract-009.svg",
                "abstract-010.svg",
                "abstract-011.svg",
                "abstract-012.svg",
                "abstract-013.svg",
                "abstract-014.svg",
                "abstract-015.svg",
                "abstract-016.svg",
                "abstract-017.svg",
                "abstract-018.svg",
                "abstract-019.svg",
                "abstract-020.svg",
                "abstract-021.svg",
                "abstract-022.svg",
                "abstract-023.svg",
                "abstract-024.svg",
                "abstract-025.svg",
                "abstract-026.svg",
                "abstract-027.svg",
                "abstract-028.svg",
                "abstract-029.svg",
                "abstract-030.svg",
                "abstract-031.svg",
                "abstract-032.svg",
                "abstract-033.svg",
                "abstract-034.svg",
                "abstract-035.svg",
                "abstract-036.svg",
                "abstract-037.svg",
                "abstract-038.svg",
                "abstract-039.svg",
                "abstract-040.svg",
                "abstract-041.svg",
                "abstract-042.svg",
                "abstract-043.svg",
                "abstract-044.svg",
                "abstract-045.svg",
                "abstract-046.svg",
                "abstract-047.svg",
                "abstract-048.svg",
                "abstract-049.svg",
                "abstract-050.svg",
                "abstract-051.svg",
                "abstract-052.svg",
                "abstract-053.svg",
                "abstract-054.svg",
                "abstract-055.svg",
                "abstract-056.svg",
                "abstract-057.svg",
                "abstract-058.svg",
                "abstract-059.svg",
                "abstract-060.svg",
                "abstract-061.svg",
                "abstract-062.svg",
                "abstract-063.svg",
                "abstract-064.svg",
                "abstract-065.svg",
                "abstract-066.svg",
                "abstract-067.svg",
                "abstract-068.svg",
                "abstract-069.svg",
                "abstract-070.svg",
                "abstract-071.svg",
                "abstract-072.svg",
                "abstract-073.svg",
                "abstract-074.svg",
                "abstract-075.svg",
                "abstract-076.svg",
                "abstract-077.svg",
                "abstract-078.svg",
                "abstract-079.svg",
                "abstract-080.svg",
                "abstract-081.svg",
                "abstract-082.svg",
                "abstract-083.svg",
                "abstract-084.svg",
                "abstract-085.svg",
                "abstract-086.svg",
                "abstract-087.svg",
                "abstract-088.svg",
                "abstract-089.svg",
                "abstract-090.svg",
                "abstract-091.svg",
                "abstract-092.svg",
                "abstract-093.svg",
                "abstract-094.svg",
                "abstract-095.svg",
                "abstract-096.svg",
                "abstract-097.svg",
                "abstract-098.svg",
                "abstract-099.svg",
                "abstract-100.svg",
                "abstract-101.svg",
                "abstract-102.svg",
                "abstract-103.svg",
                "abstract-104.svg",
                "abstract-105.svg",
                "abstract-106.svg",
                "abstract-107.svg",
                "abstract-108.svg",
                "abstract-109.svg",
                "abstract-110.svg",
                "abstract-111.svg",
                "abstract-112.svg",
                "abstract-113.svg",
                "abstract-114.svg",
                "abstract-115.svg",
                "abstract-116.svg",
                "abstract-117.svg",
                "abstract-118.svg",
                "abstract-119.svg",
                "abstract-120.svg",
                "abstract-121.svg"
            ]
            
        },
        cards_diabolist: {
            prefix: 'Sprites/Cards/Diabolist/',
            files: [
                'ants.png', 'armor-upgrade.png', 'attached-shield.png', 'burning-skull.png',
                'cobra.png', 'daemon-skull.png', 'despair.png', 'disintegrate (1).png',
                'disintegrate.png', 'dread.png', 'eye-shield.png', 'fire-gem.png',
                'gem-pendant.png', 'gunshot.png', 'horned-skull.png', 'jason-mask.png',
                'lit-candelabra.png', 'maggot.png', 'pentacle.png', 'pentagram-rose.png',
                'praying-mantis.png', 'reaper-scythe.png', 'shield-bounces.png', 'shield-reflect.png',
                'skull-bolt.png', 'skull-staff.png', 'spade-skull.png', 'spider-eye.png',
                'spider-face.png', 'templar-shield.png', 'terror.png', 'wasp-sting.png'
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
                'Slime Iceii.png', 'Slime RPG Basic.png',

                // french
                "Eldritch Corruption Deer.png", "Eldritch Soldier Gunner.png", "Eldritch Corruption Crow.png"
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
                'sticky-boot.png', 'surprised-skull.png', 'unbalanced.png', 'weight-lifting-up.png', 'pizza-slice.svg'
            ]
        },
        map_icons: {
            prefix: 'Sprites/MapIcons/',
            files: [
                "old-wagon.svg",
                'boss-icon.png', 'elite-icon.png', 'entrance-icon.png', 'event-icon.png', 'rest-icon.png', 'shop-icon.png', 'room-fight-icon.png', 'treasure-icon.png'
            ]
        },
        combat_resources: {
            prefix: 'Sprites/CombatResources/',
            files: ['powder_icon.png', 'iron_icon.png', 'papers_icon.png', 'feather_icon.png', 'venture_icon.png', 'smog_icon.png', 'ashes_icon.png', 'blood_icon.svg']
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
        intent_icons: {
            prefix: 'Sprites/IntentIcons/',
            files: [
                'knife-thrust.png', 'magick-trick.png', 'poison-bottle-2.png', 'round-shield.png',
                'star-swirl.png', 'uncertainty.png', 'unstable-orb.png', 'sword-array.svg'
            ]
        },
        effects: {
            prefix: 'Sprites/Effects/',
            files: ['particle.png']
        }
    };

    private readonly baseURL: string = 'https://raw.githubusercontent.com/MisterFlask/PhaserCardGame/master/resources/';

    /**
     * Loads all images from all categories into the Phaser loader.
     * The key is automatically derived from the filename by stripping the `.png` extension.
     * @param loader - The Phaser loader object.
     */
    public loadAllImages(loader: Phaser.Loader.LoaderPlugin): void {
        for (const category in GameImageLoader.images) {
            const categoryData = GameImageLoader.images[category as keyof typeof GameImageLoader.images];
            categoryData.files.forEach((file: string) => {
                const key = file.replace(/\.(png|svg)$/, '');
                if (file.endsWith('.svg')) {
                    loader.svg({
                        key: key,
                        url: `${this.baseURL}${categoryData.prefix}${file}`
                    });
                } else {
                    loader.image({
                        key: key,
                        url: `${this.baseURL}${categoryData.prefix}${file}`
                    });
                }
                const texture = loader.scene.textures.get(key);
                if (texture && !file.endsWith('.svg')) {
                    texture.setFilter(Phaser.Textures.LINEAR);
                }
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
