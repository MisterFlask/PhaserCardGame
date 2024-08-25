export default class RandomImageLoader {
    // Nested object containing categories with file prefix and an array of image filenames
    private readonly images = {
        backgrounds: {
            prefix: 'Backgrounds/',
            files: ['battleback1.png', 'greyscale.png']
        },
        characters: {
            prefix: 'Portraits/BlackhandPortraits/',
            files: ['flamer1.png']
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
                loader.image(key, `${this.baseURL}${categoryData.prefix}${file}`);
            });
        }
    }
}
