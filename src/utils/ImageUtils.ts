export default class GameImageLoader {
    // Nested object containing categories with file prefix and an array of image filenames
    private readonly images = {
        backgrounds: {
            prefix: 'Backgrounds/',
            files: ['battleback1.png', 'greyscale.png', "mapbackground1.png", "vintage_brown.png"]
        },
        characters: {
            prefix: 'Portraits/BlackhandPortraits/',
            files: ['flamer1.png']
        },
        ui: {
            prefix: 'UI/',
            files: ['drawpile.png', "discardpile.png"]
        },
        cards_blackhand: {
            prefix: 'Sprites/Cards/Blackhand/',
            files: ['fire.png', 'smog-grenade.png']
        },
        cards_diabolist: {
            prefix: 'Sprites/Cards/Diabolist/',
            files: ['gem-pendant.png', 'skull-bolt.png']
        },
        enemies: {
            prefix: 'Sprites/Enemies/v2/',
            files: [
                'Blood Manipulation Mage.png',
                'Blood Manipulation Slime.png',
                'Boss Flying Devourer.png',
                'Breakfast Nightmares Bacon Beast.png',
                'Breakfast Nightmares Bread Loaf.png',
                'Clockwork Abomination.png',
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
        for (const category in this.images) {
            const categoryData = this.images[category as keyof typeof this.images];
            categoryData.files.forEach((file: string) => {
                const key = file.replace('.png', '');
                loader.image({
                    key: key,
                    url: `${this.baseURL}${categoryData.prefix}${file}`
                });                
                const texture = loader.scene.textures.get(key);
                if (texture) {
                    texture.setFilter(Phaser.Textures.LINEAR);
                }
            });
        }
    }
}
