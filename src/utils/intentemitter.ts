import Phaser from 'phaser';
import { PhysicalIntent } from '../gamecharacters/PhysicalIntent';

export class IntentEmitter extends Phaser.Events.EventEmitter {
    private static instance: IntentEmitter;

    private constructor() {
        super();
    }

    public static getInstance(): IntentEmitter {
        if (!IntentEmitter.instance) {
            IntentEmitter.instance = new IntentEmitter();
        }
        return IntentEmitter.instance;
    }

    public emitIntentHover(intent: PhysicalIntent): void {
        this.emit('intenthover', intent);
    }

    public emitIntentHoverEnd(intent: PhysicalIntent): void {
        this.emit('intenthoverend', intent);
    }
}