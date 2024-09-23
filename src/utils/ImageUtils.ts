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
            files: ['greyscale.png', 'mapbackground1.png', 'vintage_brown.png', 'battleback1.png']
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
        ui: {
            prefix: 'UI/',
            files: ['drawpile.svg', 'discardpile.svg', 'placeholder.png', 'oops_image.webp']
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
        cards_diabolist: {
            prefix: 'Sprites/Cards/Diabolist/',
            files: [
                'ants.png', 'armor-upgrade.png', 'attached-shield (1).png', 'burning-skull.png',
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
                'Slime Iceii.png', 'Slime RPG Basic.png'
            ]
        },
        attributes_and_augments: {
            prefix: 'Sprites/AttributesAndAugments/',
            files: [
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
                'boss-icon.png', 'elite-icon.svg', 'entrance-icon.png', 'event-icon.svg', 'rest-icon.svg', 'shop-icon.svg', 'room-fight-icon.svg', 'treasure-icon.svg'
            ]
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
            files: ['Circle.png', 'cursed-star.png']
        },
        intent_icons: {
            prefix: 'Sprites/IntentIcons/',
            files: [
                'knife-thrust.png', 'magick-trick.png', 'poison-bottle-2.png', 'round-shield.png',
                'star-swirl.png', 'uncertainty.png', 'unstable-orb.png'
            ]
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

    public static getRandomImageNameFromCategory(category: keyof typeof this.images): string {
        const categoryData = this.images[category];
        const randomIndex = Math.floor(Math.random() * categoryData.files.length);
        
        const randomFile = categoryData.files[randomIndex];
        return randomFile.replace(/\.(png|svg)$/, '');
    }
}
