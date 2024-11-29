import { CardResourceScaling } from "../gamecharacters/PlayableCard";
import { TextGlyphs } from "./TextGlyphs";

export class ResourceDisplayGenerator {
    private static instance: ResourceDisplayGenerator;

    private constructor() {}

    public static getInstance(): ResourceDisplayGenerator {
        if (!ResourceDisplayGenerator.instance) {
            ResourceDisplayGenerator.instance = new ResourceDisplayGenerator();
        }
        return ResourceDisplayGenerator.instance;
    }

    public generateResourceScalingText(resourceScalings: CardResourceScaling[]): string {
        if (!resourceScalings || resourceScalings.length === 0) {
            return "";
        }


        const glyphs = TextGlyphs.getInstance();
        let text = "";

        for (const scaling of resourceScalings) {
            let resourceIcon = scaling.resource.glyph;
            
            // Add scaling information with icons
            if (scaling.attackScaling) {
                text += `${scaling.attackScaling}${resourceIcon}🠖${glyphs.attackIcon}\n`;
            }
            if (scaling.blockScaling) {
                text += `${scaling.blockScaling}${resourceIcon}🠖${glyphs.blockIcon}\n`;
            }
            if (scaling.magicNumberScaling) {
                text += `${scaling.magicNumberScaling}${resourceIcon}🠖${glyphs.magicIcon}\n`;
            }
        }

        return text.trim();
    }
}
