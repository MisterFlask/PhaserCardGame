 // for each image in the selected folder, rename it to the format "[prefix_n].[png|svg]" where n is a number starting from 1 and incrementing for each image. Do not modify the file extension.

 // then. print to the console the names of the image, formatted as a JSON list.

import * as fs from 'node:fs';
import * as path from 'node:path';

function formatImages(folderPath: string, prefix: string): void {
    console.log(`Formatting images in ${folderPath} with prefix ${prefix}`);
    try {
        // Read all files in the directory
        const files = fs.readdirSync(folderPath);

        // Filter image files (png and svg)
        const imageFiles = files.filter(file => 
            file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.svg')
        );

        // Sort files to ensure consistent numbering
        imageFiles.sort();

        const renamedFiles: string[] = [];

        // Rename each image file
        imageFiles.forEach((file, index) => {
            const oldPath = path.join(folderPath, file);
            const extension = path.extname(file);
            const newFileName = `${prefix}_${index + 1}${extension}`;
            const newPath = path.join(folderPath, newFileName);
            console.log(`Renaming ${file} to ${newFileName}`);

            fs.renameSync(oldPath, newPath);
            renamedFiles.push(newFileName);
        });

        // Print the renamed files as a JSON list
        console.log(JSON.stringify(renamedFiles, null, 2));
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Usage example:
// formatImages('/path/to/image/folder', 'image');

formatImages('./resources/Portraits/BlackhandPortraits/female', 'blackhand_female');

