
export class StrategicResource {
    public flavorText: string;
    public name: string;
    public description: string;
    public imageName: string;
    public id: string;
    public quantity: number = 0;

    constructor(name: string, flavorText: string,  description: string, imageName: string, id: string, quantity: number = 0) {
        this.flavorText = flavorText;
        this.name = name;
        this.description = description;
        this.imageName = imageName;
        this.quantity = quantity;
        this.id = id;
    }

    public ofQuantity(quantity: number) {
        return new StrategicResource(this.name, this.flavorText, this.description, this.imageName, this.id, quantity);
    }

    public addQuantity(quantity: number) {
        this.quantity += quantity;
    }

    public removeQuantity(quantity: number) {
        this.quantity -= quantity;
    }

    static InfernalMachinery = new StrategicResource("Infernal Machinery", "Infernal Machinery", "Infernal Machinery", "infernal_machinery", "infernal_machinery");
    static WhiteflameDistillate = new StrategicResource("Whiteflame Distillate", "Whiteflame Distillate", "Whiteflame Distillate", "whiteflame_distillate", "whiteflame_distillate");
    static Hush = new StrategicResource("Hush", "Hush", "Hush", "hush", "hush");

}
